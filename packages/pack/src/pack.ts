import {
  InstanceOfSchema,
  isDataType,
  ModelNodeField,
  ModelNodeKind,
  ModelNodeStruct,
  Schema,
} from "@javelin/model"
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

export function serialize<S extends Schema>(
  out: BufferField[],
  spec: ModelNodeStruct,
  object: InstanceOfSchema<S>,
  offset = 0,
) {
  for (let i = 0; i < spec.edges.length; i++) {
    const child = spec.edges[i]
    const { key } = child
    const value = object[key]

    switch (child.kind) {
      case ModelNodeKind.Array: {
        offset += pushArrayLengthField(out, value.length)
        if ("type" in child) {
          for (let j = 0; j < value.length; j++) {
            offset += pushBufferField(out, dataTypeToView(child.type), value[j])
          }
        } else {
          for (let j = 0; j < value.length; j++) {
            offset = serialize(
              out,
              child,
              value[j] as InstanceOfSchema<any>[],
              offset,
            )
          }
        }
        break
      }
      // TODO: support map
      case ModelNodeKind.Map:
        break
      case ModelNodeKind.Struct:
        offset = serialize(out, child as ModelNodeStruct, value, offset)
        break
      case ModelNodeKind.Primitive:
        offset += pushBufferField(
          out,
          dataTypeToView((child as ModelNodeField).type),
          value,
        )
        break
    }
  }

  return offset
}

export function encode(object: any, spec: ModelNodeStruct): ArrayBuffer {
  const bufferFields: BufferField[] = []
  const bufferSize = serialize(bufferFields, spec, object)
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
  return field.byteLength * (field.length || 1)
}

export function decode(buffer: ArrayBuffer, spec: ModelNodeStruct) {
  const bufferView = new DataView(buffer)

  let offset = 0

  const build = (node: ModelNodeStruct) => {
    const object: any = {}

    for (let i = 0; i < node.edges.length; i++) {
      const child = node.edges[i]
      const { key } = child
      switch (child.kind) {
        case ModelNodeKind.Array: {
          const length = uint32.read(bufferView, offset, 0)
          const array: any[] = []
          object[key] = array
          offset += uint32.byteLength
          if ("type" in child) {
            for (let j = 0; j < length; j++) {
              offset += decodeProperty(
                array,
                j,
                dataTypeToView(child.type),
                bufferView,
                offset,
              )
            }
          } else {
            for (let j = 0; j < length; j++) {
              array[j] = build(child)
            }
          }
          break
        }
        // TODO: support map
        case ModelNodeKind.Map:
          break
        case ModelNodeKind.Struct: {
          object[key] = build(child as ModelNodeStruct)
          break
        }
        case ModelNodeKind.Primitive:
          offset += decodeProperty(
            object,
            child.key,
            dataTypeToView((child as ModelNodeField).type),
            bufferView,
            offset,
          )
          break
      }
    }

    return object
  }

  return build(spec)
}

export * from "./views"
