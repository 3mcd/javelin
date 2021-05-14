import {
  $struct,
  ModelNode,
  ModelNodeStruct,
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

export function encode(object: any, type: ModelNodeStruct): ArrayBuffer {
  const bufferFields: BufferField[] = []
  const bufferSize = serialize(bufferFields, type, object)
  const buffer = new ArrayBuffer(bufferSize)
  const bufferView = new DataView(buffer)

  let offset = 0

  for (let i = 0; i < bufferFields.length; i++) {
    const bufferField = bufferFields[i]
    bufferField.view.write(bufferView, offset, bufferField.value)
    offset += bufferField.byteLength
  }

  return buffer
}

export function decodeProperty(
  out: any,
  key: string | number,
  field: Field,
  bufferView: DataView,
  offset: number,
) {
  out[key] = field.read(bufferView, offset, field.length || 0)
  return offset + field.byteLength * (field.length || 1)
}

const deserialize = (
  bufferView: DataView,
  node: ModelNode,
  object: any,
  key: string | number,
  offset: number = 0,
) => {
  let child: any

  switch (node.kind) {
    case SchemaKeyKind.Primitive:
      offset = decodeProperty(
        object,
        key,
        dataTypeToView(node.type),
        bufferView,
        offset,
      )
      break
    case SchemaKeyKind.Array: {
      const length = uint32.read(bufferView, offset, 0)
      offset += uint32.byteLength
      child = [] as any[]
      for (let i = 0; i < length; i++) {
        offset = deserialize(bufferView, node.edge, child, i, offset)
      }
      break
    }
    // TODO: support map
    case SchemaKeyKind.Object:
      break
    case $struct: {
      child = {}
      for (let i = 0; i < node.edges.length; i++) {
        const edge = node.edges[i]
        offset = deserialize(bufferView, edge, child, edge.key, offset)
      }
      break
    }
  }

  if (child !== undefined) {
    object[key] = child
  }

  return offset
}

export function decode<T>(buffer: ArrayBuffer, type: ModelNodeStruct): T {
  const bufferView = new DataView(buffer)
  const root = {}

  let offset = 0

  for (let i = 0; i < type.edges.length; i++) {
    const edge = type.edges[i]
    offset = deserialize(bufferView, edge, root, edge.key, offset)
  }

  return root as T
}

export * from "./views"
