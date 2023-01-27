import {
  Component,
  Dynamic,
  Entity,
  Format,
  getSchema,
  Schema,
  Selector,
  type,
  World,
} from "@javelin/ecs"
import {exists} from "@javelin/lib"
import {PriorityQueueInt} from "./priority_queue_int.js"
import {ReadStream, WriteStream} from "./stream.js"

type EncodeEntity = ((entity: Entity, stream: WriteStream) => void) & {
  BYTES_PER_ELEMENT: number
}
type DecodeEntity = ((stream: ReadStream) => void) & {
  BYTES_PER_ELEMENT: number
}
type EncoderMap = Record<number, EntityEncoder>

type SubjectPrioritizer = (
  entity: Entity,
  subject: Entity,
  world: World,
) => number

const MTU_SIZE = 1_300

let subjectLengths: Record<number, number> = {}
let formatLengths: Record<Format, number> = {
  u8: 1,
  u16: 2,
  u32: 4,
  i8: 1,
  i16: 2,
  i32: 4,
  f32: 4,
  f64: 8,
  number: 4,
}

let streamWriteMethods: Record<Format, keyof WriteStream> = {
  u8: "writeU8",
  u16: "writeU16",
  u32: "writeU32",
  i8: "writeI8",
  i16: "writeI16",
  i32: "writeI32",
  f32: "writeF32",
  f64: "writeF64",
  number: "writeF32",
}

let streamReadMethods: Record<Format, keyof ReadStream> = {
  u8: "readU8",
  u16: "readU16",
  u32: "readU32",
  i8: "readI8",
  i16: "readI16",
  i32: "readI32",
  f32: "readF32",
  f64: "readF64",
  number: "readF32",
}

let getEncodedEntityLength = (subject: Selector) => {
  let length = subjectLengths[subject.hash]
  if (exists(length)) {
    return length
  }
  length = 4
  for (let component of subject.type.components) {
    let schema = getSchema(component)
    if (exists(schema) && schema !== Dynamic) {
      if (typeof schema === "string") {
        length += formatLengths[schema]
      } else {
        for (let prop in schema) {
          let format = schema[prop]
          length += formatLengths[format]
        }
      }
    }
  }
  subjectLengths[subject.hash] = length
  return length
}

let compileWriteExp = (format: Format, stream: string, value: string) => {
  let method = streamWriteMethods[format]
  return `${stream}.${method}(${value})`
}

let compileReadExp = (format: Format, stream: string) => {
  let method = streamReadMethods[format]
  return `${stream}.${method}()`
}

let comileEncodeEntity = (selector: Selector, world: World): EncodeEntity => {
  let components = selector.type.components.filter(component => {
    let schema = getSchema(component)
    return exists(schema) && schema !== Dynamic
  })
  let componentSchemas = components.map(getSchema) as Schema[]
  let componentStores = components.map(component =>
    world.getComponentStore(component),
  )
  let encodeEntity = Function(
    "CS",
    components.map((_, i) => `let s${i}=CS[${i}];`).join("") +
      "return(e,s)=>{" +
      "s.writeU32(e);" +
      componentSchemas
        .map((schema, i) => {
          let encodeExp = `let v${i}=s${i}[e];`
          if (typeof schema === "string") {
            let writeExp = compileWriteExp(schema, "s", `v${i}`)
            encodeExp += `s[e]=${writeExp};`
          } else {
            for (let key in schema) {
              let writeExp = compileWriteExp(schema[key], "s", `v${i}.${key}`)
              encodeExp += `${writeExp};`
            }
          }
          return encodeExp
        })
        .join("") +
      "}",
  )(componentStores)
  return encodeEntity
}

let compileDecodeEntity = (selector: Selector, world: World): DecodeEntity => {
  let components = selector.type.components.filter(component => {
    let schema = getSchema(component)
    return exists(schema) && schema !== Dynamic
  })
  let componentSchemas = components.map(getSchema) as Schema[]
  let componentValuesExp = componentSchemas
    .map(schema => {
      if (typeof schema === "string") {
        return compileReadExp(schema, "s")
      } else {
        let component_value = `{`
        for (let key in schema) {
          let read_exp = compileReadExp(schema[key], "s")
          component_value += `${key}:${read_exp},`
        }
        component_value += "}"
        return component_value
      }
    })
    .join(",")
  let decodeEntity = Function(
    "S",
    "W",
    "return s=>{" +
      "let e=s.readU32();" +
      `W.exists(e)?W.add(e,S,${componentValuesExp}):W.reserve(e,S,${componentValuesExp})` +
      "}",
  )(selector, world)
  return decodeEntity
}

class EntityEncoder {
  static encodersByWorld = new WeakMap<World, EncoderMap>()

  readonly encode
  readonly decode
  readonly bytesPerEntity

  static getEntityEncoder(world: World, selector: Selector) {
    let encoders = this.encodersByWorld.get(world)
    if (!exists(encoders)) {
      encoders = []
      this.encodersByWorld.set(world, encoders)
    }
    return (encoders[selector.hash] ??= new EntityEncoder(selector, world))
  }

  constructor(selector: Selector, world: World) {
    this.encode = comileEncodeEntity(selector, world)
    this.decode = compileDecodeEntity(selector, world)
    this.bytesPerEntity = getEncodedEntityLength(selector)
  }
}

/**
 * Encodes and decodes entity interest messages.
 */
export let interestMessageType = {
  encode(stream: WriteStream, world: World, interest: Interest) {
    let subjectSelectorComponents = interest.subjectSelector.type.components
    let subjectEncoder = EntityEncoder.getEntityEncoder(
      world,
      interest.subjectSelector,
    )
    let mtuDiff = MTU_SIZE - stream.offset
    if (mtuDiff <= 0) {
      return
    }
    let growAmount =
      interest.metaLength +
      Math.min(
        mtuDiff,
        interest.subjectQueue.length * subjectEncoder.bytesPerEntity,
      )
    stream.grow(growAmount)
    // (1)
    stream.writeU8(subjectSelectorComponents.length)
    // (2)
    for (let i = 0; i < subjectSelectorComponents.length; i++) {
      stream.writeU32(subjectSelectorComponents[i])
    }
    // (3)
    let subjectCount = 0
    let subjectCountOffset = stream.writeU16(0)
    while (stream.offset < MTU_SIZE && !interest.subjectQueue.isEmpty()) {
      let entity = interest.subjectQueue.pop()!
      // (4)
      subjectEncoder.encode(entity, stream)
      subjectCount++
    }
    stream.writeU16At(subjectCount, subjectCountOffset)
  },
  decode(stream: ReadStream, world: World) {
    // (1)
    let subjectSelectorComponentsLength = stream.readU8()
    // (2)
    let subjectSelectorComponents: Component[] = []
    for (let i = 0; i < subjectSelectorComponentsLength; i++) {
      subjectSelectorComponents.push(stream.readU32() as Component)
    }
    let subjectSelector = type(...subjectSelectorComponents)
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectSelector)
    // (3)
    let subjectCount = stream.readU16()
    for (let i = 0; i < subjectCount; i++) {
      // (4)
      subjectEncoder.decode(stream)
    }
  },
}

export class Interest {
  readonly entity: Entity
  readonly metaLength: number
  readonly subjectPrioritizer?: SubjectPrioritizer
  readonly subjectQueue: PriorityQueueInt<Entity>
  readonly subjectSelector: Selector

  constructor(
    entity: Entity,
    subjectSelector: Selector,
    subjectPrioritizer?: SubjectPrioritizer,
  ) {
    this.entity = entity
    this.metaLength = 1 + 2 + subjectSelector.type.components.length * 4
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectQueue = new PriorityQueueInt()
    this.subjectSelector = subjectSelector
  }

  prioritize(world: World) {
    world
      .monitor(this.subjectSelector)
      .eachIncluded(entity => {
        this.subjectQueue.push(entity, 0)
      })
      .eachExcluded(entity => {
        this.subjectQueue.remove(entity)
      })
    world.of(this.subjectSelector).each(entity => {
      let priority = this.subjectPrioritizer?.(this.entity, entity, world) ?? 0
      this.subjectQueue.push(entity, priority)
    })
  }
}

export let makeInterest = (
  entity: Entity,
  subject: Selector,
  subjectPrioritizer?: SubjectPrioritizer,
) => new Interest(entity, subject, subjectPrioritizer)
