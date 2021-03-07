import { uint32, View } from "./views"

export type Field<T = unknown> = {
  __field: true
  type: View<T>
  length?: number
}

export type Schema = { [key: string]: Field | Schema } | Array<Field | Schema>

export type SchemaInstance<S extends Schema> = {
  [K in keyof S]: S[K] extends Field<infer T> ? T : never
}

export function field<T>(
  options: Omit<Field<T>, "__field"> | View<T>,
  length?: number,
): Field<T> {
  return "byteLength" in options
    ? { __field: true, type: options, length }
    : {
        __field: true,
        ...options,
      }
}

export function isField(object: Record<string, any>): object is Field {
  return object.__field === true
}

type BufferField<T = unknown> = {
  type: View<T>
  value: T
  byteLength: number
}

function pushBufferField<T>(out: BufferField[], field: Field<T>, value: T) {
  const byteLength = field.type.byteLength * (field.length || 1)

  out.push({
    type: field.type,
    value: typeof value === "string" ? value.slice(0, field.length) : value,
    byteLength,
  })

  return byteLength
}

function pushArrayLengthField(out: BufferField[], length: number) {
  out.push({
    type: uint32,
    value: length,
    byteLength: uint32.byteLength,
  })

  return uint32.byteLength
}

export function serialize<S extends Schema>(
  out: BufferField[],
  schema: S,
  data: SchemaInstance<S>,
  offset = 0,
) {
  if (Array.isArray(schema)) {
    const field = schema[0] as Field | Schema

    offset += pushArrayLengthField(out, (data as any).length)

    if (isField(field)) {
      for (let i = 0; i < data.length; i++) {
        offset += pushBufferField(out, field, (data as any)[i])
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        offset = serialize(out, field, (data as any)[i], offset)
      }
    }
  } else {
    for (const prop in schema) {
      const field = schema[prop]
      const value = data[prop]

      if (isField(field)) {
        offset += pushBufferField(out, field, value)
      } else {
        offset = serialize(out, field as any, value as any, offset)
      }
    }
  }

  return offset
}

export function encode<S extends Schema>(
  object: SchemaInstance<S>,
  schema: S,
): ArrayBuffer {
  const bufferFields: BufferField[] = []
  const bufferSize = serialize(bufferFields, schema, object)
  const buffer = new ArrayBuffer(bufferSize)
  const bufferView = new DataView(buffer)

  let offset = 0

  for (let i = 0; i < bufferFields.length; i++) {
    const bufferField = bufferFields[i]
    bufferField.type.write(bufferView, offset, bufferField.value)
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
  out[key] = field.type.read(bufferView, offset, field.length || 0)
  return field.type.byteLength * (field.length || 1)
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

      if (isField(field)) {
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

        if (isField(field)) {
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
