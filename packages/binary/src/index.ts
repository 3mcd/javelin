import { View } from "./views"

export type Field<T = unknown> = {
  __field: true
  type: View<T>
  defaultValue: T
  length?: number
}

export type Schema = { [key: string]: Field | Schema }

export type SchemaInstance<S extends Schema> = {
  [K in keyof S]: S[K] extends Field<infer T> ? T : never
}

function isField(object: any): object is Field {
  return "__field" in object
}

type BufferField<T = unknown> = {
  type: View<T>
  value: T
  byteLength: number
}

export function flatten<S extends Schema>(
  out: BufferField[],
  schema: S,
  data: SchemaInstance<S>,
  offset = 0,
) {
  for (const prop in schema) {
    const field = schema[prop]
    const value = data[prop]

    if (isField(field)) {
      const byteLength = field.type.byteLength * (field.length || 1)
      out.push({
        type: field.type,
        value: typeof value === "string" ? value.slice(0, field.length) : value,
        byteLength,
      })
      offset += byteLength
    } else {
      offset = flatten(
        out,
        field as Schema,
        value as SchemaInstance<Schema>,
        offset,
      )
    }
  }

  return offset
}

export function serialize<S extends Schema>(
  object: SchemaInstance<S>,
  schema: S,
): ArrayBuffer {
  const bufferFields: BufferField[] = []
  const bufferSize = flatten(bufferFields, schema, object)
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

export function deserialize<S extends Schema>(buffer: ArrayBuffer, schema: S) {
  const out = {} as SchemaInstance<S>
  const bufferView = new DataView(buffer)

  let offset = 0

  const inner = <T extends Schema>(out: SchemaInstance<T>, schema: T) => {
    for (const prop in schema) {
      const field = schema[prop]

      if (isField(field)) {
        out[prop] = field.type.read(
          bufferView,
          offset,
          field.length || 0,
        ) as any
        offset += field.type.byteLength * (field.length || 1)
      } else {
        const map = {} as any
        out[prop] = map
        inner(map, field as any)
      }
    }
  }

  inner(out, schema)

  return out
}
