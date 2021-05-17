import {
  $struct,
  arrayOf,
  assert,
  createModel,
  DataType,
  dynamic,
  ErrorType,
  Model,
  ModelNode,
  objectOf,
  Schema,
  SchemaKey,
  SchemaKeyKind,
} from "@javelin/core"
import {
  boolean,
  dataTypeToView,
  float32,
  float64,
  int16,
  int32,
  int8,
  string16,
  string8,
  uint16,
  uint32,
  uint8,
} from "@javelin/pack"

const DATA_TYPE_IDS: { [key: string]: number } = {
  [uint8.__type__]: 0,
  [uint16.__type__]: 1,
  [uint32.__type__]: 2,
  [int8.__type__]: 3,
  [int16.__type__]: 4,
  [int32.__type__]: 5,
  [float32.__type__]: 6,
  [float64.__type__]: 7,
  [string8.__type__]: 8,
  [string16.__type__]: 9,
  [boolean.__type__]: 10,
  [dynamic.__type__]: 11,
}

const DATA_TYPE_IDS_LOOKUP = [
  uint8,
  uint16,
  uint32,
  int8,
  int16,
  int32,
  float32,
  float64,
  string8,
  string16,
  boolean,
  dynamic,
]

const SCHEMA_MASK = 1 << 7
const ARRAY = DATA_TYPE_IDS_LOOKUP.length
const OBJECT = ARRAY + 1

function getDataTypeId(field: DataType) {
  const id = DATA_TYPE_IDS[dataTypeToView(field).__type__]
  assert(
    id !== undefined,
    `invalid data type ${field.__type__}`,
    ErrorType.Internal,
  )
  return id
}

function encodeModelNode(node: ModelNode, out: number[], offset: number = 0) {
  switch (node.kind) {
    case SchemaKeyKind.Primitive:
      out.push(getDataTypeId(node.type))
      offset++
      break
    case SchemaKeyKind.Array:
      out.push(ARRAY)
      offset++
      offset = encodeModelNode(node.edge, out, offset)
      break
    case SchemaKeyKind.Object:
      out.push(OBJECT)
      offset++
      offset = encodeModelNode(node.edge, out, offset)
      break
    // TODO: support set
    case SchemaKeyKind.Set:
      offset++
      break
    // TODO: support map
    case SchemaKeyKind.Map:
      offset++
      break
    case $struct: {
      const length = node.edges.length
      out.push(length | SCHEMA_MASK)
      offset++
      for (let i = 0; i < node.edges.length; i++) {
        const edge = node.edges[i]
        const { key } = edge
        out.push(key.length)
        offset++
        for (let i = 0; i < key.length; i++) {
          out.push(key.charCodeAt(i))
          offset++
        }
        offset = encodeModelNode(node.edges[i], out, offset)
      }
      break
    }
  }

  return offset
}

export function encodeModel(model: Model) {
  const flat: number[] = []
  let size = 0
  for (const prop in model) {
    flat.push(+prop)
    size += encodeModelNode(model[prop], flat) + 1
  }
  const buffer = new ArrayBuffer(size)
  const encoded = new Uint8Array(buffer)
  for (let i = 0; i < flat.length; i++) {
    encoded[i] = flat[i]
  }
  return buffer
}

export function decodeSchemaKey(
  encoded: Uint8Array,
  offset: number,
  schema: SchemaKey,
  key: keyof SchemaKey,
) {
  const dataTypeId = encoded[offset++]
  let schemaKey: SchemaKey
  if (dataTypeId === ARRAY) {
    schemaKey = arrayOf<SchemaKey>(uint8)
    offset = decodeSchemaKey(encoded, offset, schemaKey, "__type__")
  } else if (dataTypeId === OBJECT) {
    schemaKey = objectOf<SchemaKey>(uint8)
    offset = decodeSchemaKey(encoded, offset, schemaKey, "__type__")
  } else if ((dataTypeId & SCHEMA_MASK) !== 0) {
    schemaKey = {}
    offset = decodeSchema(encoded, offset - 1, schemaKey)
  } else {
    schemaKey = DATA_TYPE_IDS_LOOKUP[dataTypeId]
  }
  schema[key] = schemaKey
  return offset
}

export function decodeSchema(
  encoded: Uint8Array,
  offset: number,
  schema: Schema,
) {
  let count = encoded[offset++] & ~SCHEMA_MASK
  while (count-- > 0) {
    let keySize = encoded[offset++]
    let key = ""
    while (keySize-- > 0) {
      key += String.fromCharCode(encoded[offset++])
    }
    offset = decodeSchemaKey(encoded, offset, schema, key as keyof SchemaKey)
  }
  return offset
}

export function decodeModel(
  dataView: DataView,
  offset: number,
  length: number,
) {
  const config = new Map()
  const encoded = new Uint8Array(dataView.buffer, offset, length)
  let o = 0
  while (o < length) {
    const schema = {}
    const schemaId = encoded[o++]
    o = decodeSchema(encoded, o, schema)
    config.set(schemaId, schema)
  }
  return createModel(config)
}
