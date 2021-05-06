import {
  arrayOf,
  assert,
  createModel,
  DataType,
  ErrorType,
  Model,
  ModelNode,
  ModelNodeKind,
  Schema,
  SchemaKey,
} from "@javelin/model"
import {
  boolean,
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
]

const SCHEMA_MASK = 1 << 7
const ARRAY = DATA_TYPE_IDS_LOOKUP.length

function getDataTypeId(field: DataType) {
  const id = DATA_TYPE_IDS[field.__type__]
  assert(id !== undefined, "", ErrorType.Internal)
  return id
}

function encodeModelNode(node: ModelNode, out: number[], offset: number = 0) {
  switch (node.kind) {
    case ModelNodeKind.Primitive:
      out.push(getDataTypeId(node.type))
      offset++
      break
    case ModelNodeKind.Array:
      out.push(ARRAY)
      offset++
      offset = encodeModelNode(node.edge, out, offset)
      break
    // TODO: support map
    case ModelNodeKind.Map:
      break
    case ModelNodeKind.Struct: {
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

export function decodeSchema(
  encoded: Uint8Array,
  offset: number,
  schema: Schema,
) {
  let length = encoded[offset++] & ~SCHEMA_MASK
  while (length-- > 0) {
    let keySize = encoded[offset++]
    let key = ""
    while (keySize-- > 0) {
      key += String.fromCharCode(encoded[offset++])
    }
    const dataTypeId = encoded[offset++]
    if (dataTypeId === ARRAY) {
      const collection = arrayOf<SchemaKey>(uint8)
      const elementType = encoded[offset++]
      if ((elementType & SCHEMA_MASK) !== 0) {
        const elementSchema = {}
        offset = decodeSchema(encoded, offset - 1, elementSchema)
        collection.__type__ = elementSchema
      } else {
        collection.__type__ = DATA_TYPE_IDS_LOOKUP[elementType]
      }
      schema[key] = collection
    } else if ((dataTypeId & SCHEMA_MASK) !== 0) {
      const child: Schema = {}
      offset = decodeSchema(encoded, offset - 1, child)
      schema[key] = child
    } else {
      schema[key] = DATA_TYPE_IDS_LOOKUP[dataTypeId]
    }
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
  let i = 0
  while (i < length) {
    const schema = {}
    const componentTypeId = encoded[i++]
    i = decodeSchema(encoded, i, schema)
    config.set(componentTypeId, schema)
  }
  return createModel(config)
}
