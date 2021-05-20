import {
  $struct,
  assert,
  ModelNode,
  ModelNodeSchema,
  SchemaKeyKind,
} from "@javelin/core"
import { dataTypeToView, uint32, View } from "./views"

type Field = View & { length?: number }

type BufferField = {
  view: View
  value: unknown
  byteLength: number
}

function pushBufferField<T>(out: BufferField[], field: Field, value: T) {
  const byteLength = field.byteLength * (field.length || 1)
  out.push({
    view: field,
    value: typeof value === "string" ? value.slice(0, field.length) : value,
    byteLength,
  })
  return byteLength
}

function pushArrayLengthField(out: BufferField[], length: number) {
  out.push({
    view: uint32,
    value: length,
    byteLength: uint32.byteLength,
  })
  return uint32.byteLength
}

export function serialize(
  out: BufferField[],
  node: ModelNode,
  object: any,
  offset = 0,
) {
  switch (node.kind) {
    case SchemaKeyKind.Primitive:
      offset += pushBufferField(out, dataTypeToView(node.type), object)
      break
    case SchemaKeyKind.Array: {
      offset += pushArrayLengthField(out, object.length)
      for (let i = 0; i < object.length; i++) {
        offset = serialize(out, node.edge, object[i], offset)
      }
      break
    }
    case SchemaKeyKind.Object:
      // TODO: support map
      break
    case $struct:
      for (let i = 0; i < node.edges.length; i++) {
        const edge = node.edges[i]
        offset = serialize(out, edge, object[edge.key], offset)
      }
      break
  }

  return offset
}

export function encode(object: any, type: ModelNode): ArrayBuffer {
  const bufferFields: BufferField[] = []
  const bufferSize = serialize(bufferFields, type, object)
  const buffer = new ArrayBuffer(bufferSize)
  const dataView = new DataView(buffer)

  let offset = 0

  for (let i = 0; i < bufferFields.length; i++) {
    const bufferField = bufferFields[i]
    bufferField.view.write(dataView, offset, bufferField.value)
    offset += bufferField.byteLength
  }

  return buffer
}

type DecodeComplex = {
  key: string | number
  value: Record<string | number, unknown>
}
type DecodePrimitive = { value: string | number | boolean }
type DecodeRoot = { value: unknown }
type DecodeCursor = { offset: number } & (
  | DecodePrimitive
  | DecodeComplex
  | DecodeRoot
)

const isComplex = (cursor: object): cursor is DecodeComplex => "key" in cursor
const NOT_COMPLEX = { key: null, value: null }

const decodeInner = (
  dataView: DataView,
  node: ModelNode,
  cursor: DecodeCursor,
) => {
  const { key, value: parent } = isComplex(cursor) ? cursor : NOT_COMPLEX
  let child: unknown
  switch (node.kind) {
    case SchemaKeyKind.Primitive: {
      const field = dataTypeToView(node.type) as Field
      child = cursor.value = field.read(
        dataView,
        cursor.offset,
        field.length || 0,
      )
      cursor.offset += field.byteLength * (field.length || 1)
      break
    }
    case SchemaKeyKind.Array: {
      const length = uint32.read(dataView, cursor.offset, 0)
      cursor.value = child = [] as Record<number, unknown>
      cursor.offset += uint32.byteLength
      for (let i = 0; i < length; i++) {
        ;(cursor as DecodeComplex).key = i
        decodeInner(dataView, node.edge, cursor)
        cursor.value = child
      }
      break
    }
    // TODO: support map
    case SchemaKeyKind.Object:
      break
    case $struct: {
      cursor.value = child = {}
      for (let i = 0; i < node.edges.length; i++) {
        const edge = node.edges[i]
        ;(cursor as DecodeComplex).key = edge.key
        decodeInner(dataView, edge, cursor)
        cursor.value = child
      }
      break
    }
  }
  if (parent && key !== null) {
    parent[key] = cursor.value
  }
  return child
}

export function decode<T>(buffer: ArrayBuffer, type: ModelNode): T {
  const dataView = new DataView(buffer)
  const cursor = { offset: 0, value: null }
  const value = decodeInner(dataView, type, cursor)
  return value as T
}

export * from "./views"
