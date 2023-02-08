import * as j from "@javelin/ecs"
import {COMPILED_LABEL, exists, expect, assert} from "@javelin/lib"
import {ReadStream, WriteStream} from "./structs/stream.js"

type EncodeEntity = (entity: j.Entity, writeStream: WriteStream) => void
type DecodeEntity = (readStream: ReadStream) => void
type EncodeValue = (value: unknown, writeStream: WriteStream) => void
type DecodeValue = (readStream: ReadStream) => void
type EncoderMap = Record<number, EntityEncoder>

let valuesLengths: Record<number, number> = {}
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
  entity: 4,
}

let writeStreamMethodsByFormat: Record<j.Format, keyof WriteStream> = {
  u8: "writeU8",
  u16: "writeU16",
  u32: "writeU32",
  i8: "writeI8",
  i16: "writeI16",
  i32: "writeI32",
  f32: "writeF32",
  f64: "writeF64",
  number: "writeF32",
  entity: "writeU32",
}

let readStreamMethodsByFormat: Record<j.Format, keyof ReadStream> = {
  u8: "readU8",
  u16: "readU16",
  u32: "readU32",
  i8: "readI8",
  i16: "readI16",
  i32: "readI32",
  f32: "readF32",
  f64: "readF64",
  number: "readF32",
  entity: "readU32",
}

export let getBytesPerTypeValues = (type: j.Type) => {
  let valuesLength = valuesLengths[type.hash]
  if (exists(valuesLength)) {
    return valuesLength
  }
  valuesLength = 0
  for (let component of type.normalized.components) {
    let schema = j.getSchema(component)
    if (exists(schema) && schema !== j._dynamic) {
      if (typeof schema === "string") {
        valuesLength += formatLengths[schema]
      } else {
        for (let prop in schema) {
          let format = schema[prop]
          valuesLength += formatLengths[format]
        }
      }
    }
  }
  valuesLengths[type.hash] = valuesLength
  return valuesLength
}

let compileWriteExp = (
  format: j.Format,
  writeStreamExp: string,
  valueExp: string,
) => {
  let writeStreamMethod = writeStreamMethodsByFormat[format]
  return `${writeStreamExp}.${writeStreamMethod}(${valueExp})`
}

let compileReadExp = (format: j.Format, readStreamExp: string) => {
  let readStreamMethod = readStreamMethodsByFormat[format]
  return `${readStreamExp}.${readStreamMethod}()`
}

export let compileWriteValueExp = (
  schema: j.Schema,
  writeStreamExp: string,
  valueExp: string,
) => {
  let exp = ""
  if (typeof schema === "string") {
    exp = compileWriteExp(schema, writeStreamExp, valueExp)
    exp += ";"
  } else {
    for (let schemaKey of Reflect.get(schema, j._keys)) {
      exp += compileWriteExp(
        schema[schemaKey],
        writeStreamExp,
        `${valueExp}.${schemaKey}`,
      )
      exp += ";"
    }
  }
  return exp
}

export let compileReadValueExp = (schema: j.Schema, readStreamExp: string) => {
  let readValueExp = ""
  if (typeof schema === "string") {
    readValueExp = compileReadExp(schema, readStreamExp)
  } else {
    readValueExp = `{`
    for (let schemaKey of Reflect.get(schema, j._keys)) {
      let readExp = compileReadExp(schema[schemaKey], readStreamExp)
      readValueExp += `${schemaKey}:${readExp},`
    }
    readValueExp += "}"
  }
  return readValueExp
}

export let compileEncodeValue = (type: j.Type): EncodeValue => {
  let component = type.components[0]
  let componentSchema = expect(j.getSchema(component))
  assert(componentSchema !== j._dynamic)
  let encodeValue = Function(
    "v",
    "s",
    COMPILED_LABEL + compileWriteValueExp(componentSchema, "s", "v"),
  )
  return encodeValue as EncodeValue
}

export let compileDecodeValue = (type: j.Type) => {
  let component = type.components[0]
  let componentSchema = expect(j.getSchema(component))
  assert(componentSchema !== j._dynamic)
  let encodeValue = Function(
    "s",
    COMPILED_LABEL + "return " + compileReadValueExp(componentSchema, "s"),
  )
  return encodeValue as DecodeValue
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
          let exp = `let v${i}=V${i}[e];`
          exp += compileWriteValueExp(schema, "s", `v${i}`)
          return exp
        })
        .join("") +
      "}",
  )(componentStores)
  return encodeEntity
}

export let compileDecodeEntityPresence = (
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
      exp += `v${i}[e]=${compileReadValueExp(schema, "s")}`
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
  static #encodersByWorld = new WeakMap<j.World, EncoderMap>()

  readonly bytesPerEntity
  readonly bytesPerValues
  readonly encodeEntity
  readonly decodeEntityPresence
  readonly decodeEntityUpdate

  static getEntityEncoder(world: j.World, type: j.Type) {
    let encoders = this.#encodersByWorld.get(world)
    if (!exists(encoders)) {
      encoders = []
      this.#encodersByWorld.set(world, encoders)
    }
    return (encoders[type.hash] ??= new EntityEncoder(type, world))
  }

  constructor(type: j.Type, world: j.World) {
    this.bytesPerValues = getBytesPerTypeValues(type)
    this.bytesPerEntity = 4 + this.bytesPerValues
    this.decodeEntityPresence = compileDecodeEntityPresence(type, world)
    this.decodeEntityUpdate = compileDecodeEntityUpdate(type, world)
    this.encodeEntity = compileEncodeEntity(type, world)
  }
}
