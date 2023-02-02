import * as j from "@javelin/ecs"
import {COMPILED_LABEL, exists} from "@javelin/lib"
import {ReadStream, WriteStream} from "./structs/stream.js"

type EncodeEntity = ((entity: j.Entity, writeStream: WriteStream) => void) & {
  BYTES_PER_ELEMENT: number
}
type DecodeEntity = ((readStream: ReadStream) => void) & {
  BYTES_PER_ELEMENT: number
}
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
}

export let getEncodedValuesLength = (type: j.Type) => {
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
  let writeValueExp = ""
  if (typeof schema === "string") {
    writeValueExp = compileWriteExp(schema, writeStreamExp, valueExp)
    writeValueExp += ";"
  } else {
    for (let schemaKey of Reflect.get(schema, j._keys)) {
      writeValueExp += compileWriteExp(
        schema[schemaKey],
        writeStreamExp,
        `${valueExp}.${schemaKey}`,
      )
      writeValueExp += ";"
    }
  }
  return writeValueExp
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

export let compileEncodeValues = (type: j.Type) => {
  let components = type.normalized.components.filter(component => {
    let schema = j.getSchema(component)
    return exists(schema) && schema !== j._dynamic
  })
  let componentSchemas = components.map(j.getSchema) as j.Schema[]
  let encodeValues = Function(
    "v",
    "s",
    COMPILED_LABEL +
      "for(let i=0;i<v.length;i++){" +
      componentSchemas
        .map(schema => compileWriteValueExp(schema, "s", "v[i]"))
        .join("") +
      "}",
  )
  return encodeValues
}

export let compileDecodeValues = (type: j.Type) => {
  let components = type.normalized.components.filter(component => {
    let schema = j.getSchema(component)
    return exists(schema) && schema !== j._dynamic
  })
  let componentSchemas = components.map(j.getSchema) as j.Schema[]
  let decodeValues = Function(
    "v",
    "s",
    "c",
    COMPILED_LABEL +
      "while(c-->0){" +
      componentSchemas.map(
        schema => `v.unshift(${compileReadValueExp(schema, "s")})`,
      ) +
      "}",
  )
  return decodeValues
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
          encodeExp += compileWriteValueExp(schema, "s", `v${i}`)
          return encodeExp
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
  static encodersByWorld = new WeakMap<j.World, EncoderMap>()

  readonly bytesPerEntity
  readonly bytesPerValues
  readonly encodeEntity
  readonly encodeValues
  readonly decodeEntityPresence
  readonly decodeEntityUpdate
  readonly decodeValues

  static getEntityEncoder(world: j.World, type: j.Type) {
    let encoders = this.encodersByWorld.get(world)
    if (!exists(encoders)) {
      encoders = []
      this.encodersByWorld.set(world, encoders)
    }
    return (encoders[type.hash] ??= new EntityEncoder(type, world))
  }

  constructor(type: j.Type, world: j.World) {
    this.bytesPerValues = getEncodedValuesLength(type)
    this.bytesPerEntity = 4 + this.bytesPerValues
    this.decodeEntityPresence = compileDecodeEntityPresence(type, world)
    this.decodeEntityUpdate = compileDecodeEntityUpdate(type, world)
    this.decodeValues = compileDecodeValues(type)
    this.encodeEntity = compileEncodeEntity(type, world)
    this.encodeValues = compileEncodeValues(type)
  }
}
