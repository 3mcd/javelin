import {
  Component,
  Dynamic,
  Entity,
  Format,
  get_schema,
  Schema,
  Selector,
  type,
  World,
} from "@javelin/ecs"
import {exists, expect} from "@javelin/lib"
import * as PriorityQueueInt from "./priority_queue_int.js"
import {ReadStream} from "./read_stream.js"
import {WriteStream} from "./write_stream.js"

type Encoder = ((entity: Entity, stream: WriteStream) => void) & {
  BYTES_PER_ELEMENT: number
}
type Decoder = ((stream: ReadStream) => void) & {
  BYTES_PER_ELEMENT: number
}
type EncoderMap = Record<number, Encoder>
type DecoderMap = Record<number, Decoder>

type SubjectPrioritySetter = (
  subject: Entity,
  object: Entity,
  world: World,
) => number

type T = {
  readonly entity: Entity
  readonly meta_length: number
  readonly subject_priority_setter?: SubjectPrioritySetter
  readonly subject_queue: PriorityQueueInt.T<Entity>
  readonly subject: Selector
}

const MTU_SIZE = 1_300

let encoders_by_world = new WeakMap<World, EncoderMap>()
let decoders_by_world = new WeakMap<World, DecoderMap>()
let subject_lengths: Record<number, number> = {}

let format_byte_lengths: Record<Format, number> = {
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

let stream_write_methods: Record<Format, keyof WriteStream> = {
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

let stream_read_methods: Record<Format, keyof ReadStream> = {
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

let get_subject_length = (subject: Selector) => {
  let subject_length = subject_lengths[subject.hash]
  if (exists(subject_length)) {
    return subject_length
  }
  subject_length = 4
  for (let i = 0; i < subject.type.components.length; i++) {
    let component = subject.type.components[i]
    let component_schema = get_schema(component)
    if (exists(component_schema) && component_schema !== Dynamic) {
      if (typeof component_schema === "string") {
        subject_length += format_byte_lengths[component_schema]
      } else {
        for (let prop in component_schema) {
          let format = component_schema[prop]
          subject_length += format_byte_lengths[format]
        }
      }
    }
  }
  subject_lengths[subject.hash] = subject_length
  return subject_length
}

let compile_write_exp = (
  format: Format,
  stream: string,
  value: string,
) => {
  let write_method = stream_write_methods[format]
  return `${stream}.${write_method}(${value})`
}

let compile_read_exp = (format: Format, stream: string) => {
  let read_method = stream_read_methods[format]
  return `${stream}.${read_method}()`
}

let compile_encoder = (subject: Selector, world: World): Encoder => {
  let components = subject.type.components.filter(component => {
    let schema = get_schema(component)
    return exists(schema) && schema !== Dynamic
  })
  let component_schemas = components.map(get_schema) as Schema[]
  let component_stores = components.map(component =>
    world.get_component_store(component),
  )
  let subject_encoder = Function(
    "CS",
    components.map((_, i) => `let s${i}=CS[${i}];`).join("") +
      "return(e,s)=>{" +
      "s.writeU32(e);" +
      component_schemas
        .map((schema, i) => {
          let encode_exp = `let v${i}=s${i}[e];`
          if (typeof schema === "string") {
            let write_exp = compile_write_exp(schema, "s", `v${i}`)
            encode_exp += `s[e]=${write_exp};`
          } else {
            for (let key in schema) {
              let write_exp = compile_write_exp(
                schema[key],
                "s",
                `v${i}.${key}`,
              )
              encode_exp += `${write_exp};`
            }
          }
          return encode_exp
        })
        .join("") +
      "}",
  )(component_stores)
  return Object.assign(subject_encoder, {
    BYTES_PER_ELEMENT: get_subject_length(subject),
  })
}

let compile_decoder = (subject: Selector, world: World): Decoder => {
  let components = subject.type.components.filter(component => {
    let schema = get_schema(component)
    return exists(schema) && schema !== Dynamic
  })
  let component_schemas = components.map(get_schema) as Schema[]
  let component_params = component_schemas
    .map(schema => {
      if (typeof schema === "string") {
        return compile_read_exp(schema, "s")
      } else {
        let component_value = `{`
        for (let key in schema) {
          let read_exp = compile_read_exp(schema[key], "s")
          component_value += `${key}:${read_exp},`
        }
        component_value += "}"
        return component_value
      }
    })
    .join(",")
  let subject_decoder = Function(
    "S",
    "W",
    "return s=>{" +
      "let e=s.readU32();" +
      `W.exists(e)?W.add(e,S,${component_params}):W.reserve(e,S,${component_params})` +
      "}",
  )(subject, world)
  return Object.assign(subject_decoder, {
    BYTES_PER_ELEMENT: get_subject_length(subject),
  })
}

let get_encoder = (subject: Selector, world: World) => {
  let encoders = encoders_by_world.get(world)
  if (!exists(encoders)) {
    encoders = []
    encoders_by_world.set(world, encoders)
  }
  return (encoders[subject.hash] ??= compile_encoder(subject, world))
}

let get_decoder = (subject: Selector, world: World) => {
  let decoders = decoders_by_world.get(world)
  if (!exists(decoders)) {
    decoders = []
    decoders_by_world.set(world, decoders)
  }
  return (decoders[subject.hash] ??= compile_decoder(subject, world))
}

/**
 * Encodes and decodes entity interest messages.
 */
export let message_type = {
  encode(stream: WriteStream, world: World, t: T) {
    let subject_encoder = get_encoder(t.subject, world)
    let mtu_diff = MTU_SIZE - stream.offset
    if (mtu_diff <= 0) {
      return
    }
    let grow_amount =
      t.meta_length +
      Math.min(
        mtu_diff,
        t.subject_queue.length * subject_encoder.BYTES_PER_ELEMENT,
      )
    stream.grow(grow_amount)
    // (1)
    stream.writeU8(t.subject.type.components.length)
    // (2)
    for (let i = 0; i < t.subject.type.components.length; i++) {
      let component = t.subject.type.components[i]
      stream.writeU32(component)
    }
    // (3)
    let entity_count_offset = stream.writeU16(0)
    let entity_count = 0
    while (
      stream.offset < MTU_SIZE &&
      PriorityQueueInt.peek(t.subject_queue) !== undefined
    ) {
      let entity = expect(PriorityQueueInt.pop(t.subject_queue))
      // (4)
      subject_encoder(entity, stream)
      entity_count++
    }
    stream.writeU16At(entity_count, entity_count_offset)
  },
  decode(stream: ReadStream, world: World) {
    // (1)
    let subject_components_length = stream.readU8()
    // (2)
    let subject_components: Component[] = []
    for (let i = 0; i < subject_components_length; i++) {
      let component = stream.readU32() as Component
      subject_components.push(component)
    }
    let subject = type(...subject_components)
    let subject_decoder = get_decoder(subject, world)
    // (3)
    let entity_count = stream.readU16()
    for (let i = 0; i < entity_count; i++) {
      // (4)
      subject_decoder(stream)
    }
  },
}

export let make = (
  entity: Entity,
  subject: Selector,
  subject_priority_setter?: SubjectPrioritySetter,
  subject_queue_max_length = 20_000,
): T => {
  let meta_length = 1 + 2 + subject.type.components.length * 4
  let subject_queue = PriorityQueueInt.make<Entity>(
    subject_queue_max_length,
  )
  return {
    entity,
    meta_length,
    subject_priority_setter,
    subject_queue,
    subject: subject,
  }
}

export let update_priorities = (t: T, world: World) => {
  world
    .monitor(t.subject)
    .eachIncluded(entity => {
      PriorityQueueInt.push(t.subject_queue, entity, 0)
    })
    .eachExcluded(entity => {
      PriorityQueueInt.remove(t.subject_queue, entity)
    })
  world.of(t.subject).each(entity => {
    let entity_priority =
      t.subject_priority_setter?.(t.entity, entity, world) ?? 0
    PriorityQueueInt.push(t.subject_queue, entity, entity_priority)
  })
}
