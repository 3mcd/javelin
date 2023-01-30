import {
  Dynamic,
  Entity,
  Format,
  getSchema,
  QuerySelector,
  Schema,
  World,
  Keys,
  _getComponentStore,
  _hasComponent,
  _reserveEntity,
} from "@javelin/ecs"
import {exists} from "@javelin/lib"
import {ReadStream, WriteStream} from "./stream.js"

type EncodeEntity = ((entity: Entity, writeStream: WriteStream) => void) & {
  BYTES_PER_ELEMENT: number
}
type DecodeEntity = ((readStream: ReadStream) => void) & {
  BYTES_PER_ELEMENT: number
}
type EncoderMap = Record<number, EntityEncoder>

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

export let getEncodedEntityLength = (subject: QuerySelector) => {
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

export let compileEncodeEntity = (
  selector: QuerySelector,
  world: World,
): EncodeEntity => {
  let components = selector.type.components.filter(component => {
    let schema = getSchema(component)
    return exists(schema) && schema !== Dynamic
  })
  let componentSchemas = components.map(getSchema) as Schema[]
  let componentStores = components.map(component =>
    world[_getComponentStore](component),
  )
  let encodeEntity = Function(
    "V",
    components.map((_, i) => `let V${i}=V[${i}];`).join("") +
      "return function encodeEntity(e,s){" +
      "s.writeU32(e);" +
      componentSchemas
        .map((schema, i) => {
          let encodeExp = `let v${i}=V${i}[e];`
          if (typeof schema === "string") {
            let writeExp = compileWriteExp(schema, "s", `v${i}`)
            encodeExp += `${writeExp};`
          } else {
            for (let schemaKey of Reflect.get(schema, Keys)) {
              let writeExp = compileWriteExp(
                schema[schemaKey],
                "s",
                `v${i}.${schemaKey}`,
              )
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

export let compileDecodeEntityCompose = (
  selector: QuerySelector,
  world: World,
): DecodeEntity => {
  let decodeEntity = Function(
    "S",
    "E",
    "A",
    "R",
    "return function decodeEntityCompose(s){" +
      "let e=s.readU32();" +
      `E(e)?A(e,S):R(e,S)` +
      "}",
  )(
    selector,
    world.exists.bind(world),
    world.add.bind(world),
    world[_reserveEntity].bind(world),
  )
  return decodeEntity
}

export let compileDecodeEntityUpdate = (
  selector: QuerySelector,
  world: World,
): DecodeEntity => {
  let components = selector.type.components.filter(component => {
    let schema = getSchema(component)
    return exists(schema) && schema !== Dynamic
  })
  let componentSchemas = components.map(getSchema) as Schema[]
  let componentStores = components.map(component =>
    world[_getComponentStore](component),
  )
  let componentValuesExp = componentSchemas
    .map((schema, i) => {
      let exp = ""
      exp += `if(H(e,${components[i]})){`
      if (typeof schema === "string") {
        let readExp = compileReadExp(schema, "s")
        exp += `v${i}[e]=${readExp}`
      } else {
        exp += `let v=v${i}[e];`
        for (let schemaKey of Reflect.get(schema, Keys)) {
          let readExp = compileReadExp(schema[schemaKey], "s")
          exp += `v.${schemaKey}=${readExp};`
        }
      }
      exp += "}else{"
      if (typeof schema === "string") {
        return compileReadExp(schema, "s")
      } else {
        let componentValue = `v${i}[e]={`
        for (let schemaKey of Reflect.get(schema, Keys)) {
          let readExp = compileReadExp(schema[schemaKey], "s")
          componentValue += `${schemaKey}:${readExp},`
        }
        componentValue += "}"
        exp += componentValue
      }
      exp += "}"
      return exp
    })
    .join("")
  let decodeEntity = Function(
    "S",
    "V",
    "H",
    components.map((_, i) => `let v${i}=V[${i}];`).join("") +
      "return function decodeEntityUpdate(s){" +
      "let e=s.readU32();" +
      componentValuesExp +
      "}",
  )(selector, componentStores, world[_hasComponent].bind(world))
  return decodeEntity
}

export class EntityEncoder {
  static encodersByWorld = new WeakMap<World, EncoderMap>()

  readonly encodeEntity
  readonly decodeEntityCompose
  readonly decodeEntityUpdate
  readonly bytesPerEntity

  static getEntityEncoder(world: World, selector: QuerySelector) {
    let encoders = this.encodersByWorld.get(world)
    if (!exists(encoders)) {
      encoders = []
      this.encodersByWorld.set(world, encoders)
    }
    return (encoders[selector.hash] ??= new EntityEncoder(selector, world))
  }

  constructor(selector: QuerySelector, world: World) {
    this.encodeEntity = compileEncodeEntity(selector, world)
    this.decodeEntityCompose = compileDecodeEntityCompose(selector, world)
    this.decodeEntityUpdate = compileDecodeEntityUpdate(selector, world)
    this.bytesPerEntity = getEncodedEntityLength(selector)
  }
}
