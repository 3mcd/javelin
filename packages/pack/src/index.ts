import { Schema, InstanceOfSchema, isDataType } from "@javelin/model"
import { uint32, View } from "./views"

type Field = View | { view: View; length: number }

type BufferField = {
  view: View
  value: unknown
  byteLength: number
}

function pushBufferField<T>(out: BufferField[], field: Field, value: T) {
  let byteLength = 0
  if ("length" in field) {
    const { view, length } = field
    byteLength = view.byteLength * length
    out.push({
      view,
      value: typeof value === "string" ? value.slice(0, length) : value,
      byteLength,
    })
  } else {
    byteLength = field.byteLength
    out.push({
      view: field,
      value,
      byteLength,
    })
  }
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
  schema: S,
  instance: InstanceOfSchema<S>,
  offset = 0,
) {
  if (Array.isArray(schema)) {
    const field = schema[0] as Field | Schema

    offset += pushArrayLengthField(out, (instance as any).length)

    if (isDataType(field)) {
      for (let i = 0; i < instance.length; i++) {
        offset += pushBufferField(out, field, (instance as any)[i])
      }
    } else {
      for (let i = 0; i < instance.length; i++) {
        offset = serialize(out, field, (instance as any)[i], offset)
      }
    }
  } else {
    for (const prop in schema) {
      const field = schema[prop]
      const value = instance[prop]

      if (isDataType(field)) {
        offset += pushBufferField(out, field, value)
      } else {
        offset = serialize(out, field as any, value as any, offset)
      }
    }
  }

  return offset
}

export function encode<S extends Schema>(
  object: InstanceOfSchema<S>,
  schema: S,
): ArrayBuffer {
  const bufferFields: BufferField[] = []
  const bufferSize = serialize(bufferFields, schema, object)
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
  out[key] = field.view.read(bufferView, offset, field.length || 0)
  return field.view.byteLength * (field.length || 1)
}

export function decode<S extends Schema>(buffer: ArrayBuffer, schema: S) {
  const bufferView = new DataView(buffer)

  let offset = 0

  const build = (schema: Schema) => {
    let result: any

    if (Array.isArray(schema)) {
      const field = schema[0]
      const length = uint32.read(bufferView, offset, 0)

      offset += uint32.byteLength

      result = []

      if (isDataType(field)) {
        for (let i = 0; i < length; i++) {
          offset += decodeProperty(result, i, field, bufferView, offset)
        }
      } else {
        for (let i = 0; i < length; i++) {
          result[i] = build(field)
        }
      }
    } else {
      result = {}

      for (const prop in schema) {
        const field = schema[prop]

        if (isDataType(field)) {
          offset += decodeProperty(result, prop, field, bufferView, offset)
        } else {
          result[prop] = build(field)
        }
      }
    }

    return result
  }

  return build(schema)
}

export * from "./views"
