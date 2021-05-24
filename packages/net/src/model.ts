import * as Core from "@javelin/core"
import { FieldNumber } from "@javelin/core"
import * as Pack from "@javelin/pack"
import { StringView } from "@javelin/pack"

const BYTE_VIEWS = [
  Pack.uint8,
  Pack.uint16,
  Pack.uint32,
  Pack.int8,
  Pack.int16,
  Pack.int32,
  Pack.float32,
  Pack.float64,
  Pack.string8,
  Pack.string16,
  Pack.boolean,
]
const BYTE_VIEWS_LOOKUP = BYTE_VIEWS.reduce((sparse, byteView) => {
  sparse[byteView[Pack.$byteView]] = byteView
  return sparse
}, [] as Pack.ByteView[])

const COLLECTION_MASK = 1 << 6
const SCHEMA_MASK = 1 << 7

function encodeField(byteView: Pack.ByteView, out: number[], offset = 0) {
  out.push(byteView[Pack.$byteView])
  offset++
  if (byteView[Core.$kind] === Core.FieldKind.String) {
    out.push((byteView as StringView).length ?? 0)
    offset++
  }
  return offset
}

function encodeNode(
  node: Core.CollatedNode<Pack.ByteView>,
  out: number[],
  offset = 0,
) {
  if (Core.isField(node)) {
    if (Core.isPrimitiveField(node)) {
      offset = encodeField(node, out, offset)
    } else {
      out.push(node[Core.$kind] | COLLECTION_MASK)
      offset++
      if ("key" in node) {
        offset = encodeField(node.key as Pack.ByteView, out, offset)
      }
      offset = encodeNode(
        node.element as Core.CollatedNode<Pack.ByteView>,
        out,
        offset,
      )
    }
  } else {
    const length = node.fields.length
    out.push(length | SCHEMA_MASK)
    offset++
    for (let i = 0; i < length; i++) {
      const key = node.keys[i]
      out.push(key.length)
      offset++
      for (let i = 0; i < key.length; i++) {
        out.push(key.charCodeAt(i))
        offset++
      }
      offset = encodeNode(node.fields[i], out, offset)
    }
  }

  return offset
}

export function encodeModel(model: Pack.ModelEnhanced) {
  const flat: number[] = []
  let size = 0
  for (const prop in model) {
    flat.push(+prop)
    size += encodeNode(model[prop], flat) + 1
  }
  const buffer = new ArrayBuffer(size)
  const encoded = new Uint8Array(buffer)
  for (let i = 0; i < flat.length; i++) {
    encoded[i] = flat[i]
  }
  return buffer
}

export function decodeField(
  encoded: Uint8Array,
  cursor: Pack.Cursor,
): Core.FieldAny | Core.Schema {
  const dataTypeId = encoded[cursor.offset++]
  let child: Core.FieldAny | Core.Schema
  if ((dataTypeId & SCHEMA_MASK) !== 0) {
    let length = dataTypeId & ~SCHEMA_MASK
    child = {} as Core.Schema
    while (length-- > 0) {
      let keySize = encoded[cursor.offset++]
      let key = ""
      while (keySize-- > 0) {
        key += String.fromCharCode(encoded[cursor.offset++])
      }
      child[key] = decodeField(encoded, cursor)
    }
  } else if ((dataTypeId & COLLECTION_MASK) !== 0) {
    const collectionType = dataTypeId & ~COLLECTION_MASK
    switch (collectionType) {
      case Core.FieldKind.Array:
        child = Core.arrayOf(decodeField(encoded, cursor))
        break
      case Core.FieldKind.Object: {
        const key = decodeField(encoded, cursor) as Pack.StringView
        child = Core.objectOf(decodeField(encoded, cursor), key)
        break
      }
      case Core.FieldKind.Set:
        child = Core.setOf(decodeField(encoded, cursor))
        break
      case Core.FieldKind.Map:
        child = Core.mapOf(
          decodeField(encoded, cursor) as FieldNumber,
          decodeField(encoded, cursor),
        )
        break
      default:
        child = Core.dynamic()
        break
    }
  } else {
    child = BYTE_VIEWS_LOOKUP[dataTypeId]
    if (Pack.isStringView(child)) {
      child = { ...child, length: encoded[cursor.offset++] } as Pack.StringView
    }
  }
  return child
}

export function decodeModel(
  dataView: DataView,
  cursor: Pack.Cursor,
  length: number,
) {
  const config = new Map()
  const encoded = new Uint8Array(dataView.buffer)
  while (cursor.offset < length) {
    const schemaId = encoded[cursor.offset++]
    const schema = decodeField(encoded, cursor)
    config.set(schemaId, schema)
  }
  return Core.createModel(config)
}
