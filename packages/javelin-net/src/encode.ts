import * as j from "@javelin/ecs"
import {COMPILED_LABEL, exists} from "@javelin/lib"
import {NetworkModel, NormalizedNetworkModel} from "./network_model.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

type EncodeEntity = ((entity: j.Entity, writeStream: WriteStream) => void) & {
  BYTES_PER_ELEMENT: number
}
type DecodeEntity = ((readStream: ReadStream) => void) & {
  BYTES_PER_ELEMENT: number
}
type EncoderMap = Record<number, EntityEncoder>

let subjectLengths: Record<number, number> = {}
let formatLengths: Record<j.Format, number> = {
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

let streamWriteMethods: Record<j.Format, keyof WriteStream> = {
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

let streamReadMethods: Record<j.Format, keyof ReadStream> = {
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

export let getEncodedEntityLength = (subject: j.Type) => {
  let length = subjectLengths[subject.hash]
  if (exists(length)) {
    return length
  }
  length = 4
  for (let component of subject.normalized.components) {
    let schema = j.getSchema(component)
    if (exists(schema) && schema !== j._dynamic) {
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

let compileWriteExp = (format: j.Format, stream: string, value: string) => {
  let method = streamWriteMethods[format]
  return `${stream}.${method}(${value})`
}

let compileReadExp = (format: j.Format, stream: string) => {
  let method = streamReadMethods[format]
  return `${stream}.${method}()`
}

export let compileEncodeEntity = (
  type: j.Type,
  world: j.World,
): EncodeEntity => {
  let components = type.normalized.components.filter(component => {
    let schema = j.getSchema(component)
    return exists(schema) && schema !== j._dynamic
  })
  let componentSchemas = components.map(j.getSchema) as j.Schema[]
  let componentStores = components.map(component =>
    world[j._getComponentStore](component),
  )
  let encodeEntity = Function(
    "V",
    COMPILED_LABEL +
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
            for (let schemaKey of Reflect.get(schema, j._keys)) {
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
  type: j.Type,
  world: j.World,
): DecodeEntity => {
  let decodeEntity = Function(
    "T",
    "E",
    "A",
    "R",
    COMPILED_LABEL +
      "return function decodeEntityCompose(s){" +
      "let e=s.readU32();" +
      `E(e)?A(e,T):R(e,T)` +
      "}",
  )(
    type,
    world.exists.bind(world),
    world.add.bind(world),
    world[j._reserveEntity].bind(world),
  )
  return decodeEntity
}

export let compileDecodeEntityUpdate = (
  type: j.Type,
  world: j.World,
): DecodeEntity => {
  let components = type.normalized.components.filter(component => {
    let schema = j.getSchema(component)
    return exists(schema) && schema !== j._dynamic
  })
  let componentSchemas = components.map(j.getSchema) as j.Schema[]
  let componentStores = components.map(component =>
    world[j._getComponentStore](component),
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
        for (let schemaKey of Reflect.get(schema, j._keys)) {
          let readExp = compileReadExp(schema[schemaKey], "s")
          exp += `v.${schemaKey}=${readExp};`
        }
      }
      exp += "}else{"
      if (typeof schema === "string") {
        return compileReadExp(schema, "s")
      } else {
        let componentValue = `v${i}[e]={`
        for (let schemaKey of Reflect.get(schema, j._keys)) {
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
    COMPILED_LABEL +
      components.map((_, i) => `let v${i}=V[${i}];`).join("") +
      "return function decodeEntityUpdate(s){" +
      "let e=s.readU32();" +
      componentValuesExp +
      "}",
  )(type, componentStores, world[j._hasComponent].bind(world))
  return decodeEntity
}

export class EntityEncoder {
  static encodersByWorld = new WeakMap<j.World, EncoderMap>()

  readonly encodeEntity
  readonly decodeEntityCompose
  readonly decodeEntityUpdate
  readonly bytesPerEntity

  static getEntityEncoder(world: j.World, type: j.Type) {
    let encoders = this.encodersByWorld.get(world)
    if (!exists(encoders)) {
      encoders = []
      this.encodersByWorld.set(world, encoders)
    }
    return (encoders[type.hash] ??= new EntityEncoder(type, world))
  }

  constructor(type: j.Type, world: j.World) {
    this.encodeEntity = compileEncodeEntity(type, world)
    this.decodeEntityCompose = compileDecodeEntityCompose(type, world)
    this.decodeEntityUpdate = compileDecodeEntityUpdate(type, world)
    this.bytesPerEntity = getEncodedEntityLength(type)
  }
}
