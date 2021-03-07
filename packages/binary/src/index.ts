import { uint16, View } from "./views"

export type Field<T = unknown> = {
  __field: true
  type: View<T>
  defaultValue: T
  length?: number
}

export type Schema = { [key: string]: Field | Schema } | Array<Field | Schema>

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
      if (Array.isArray(field)) {
        const f = field[0]

        // console.log(prop, value, field)

        out.push({
          type: uint16,
          value: (value as Array<unknown>).length,
          byteLength: uint16.byteLength,
        })

        offset += uint16.byteLength

        if ("byteLength" in f) {
          const byteLength = f.type.byteLength * (f.length || 1)
          // view (leaf)
          for (let i = 0; i < (value as Array<unknown>).length; i++) {
            const x = (value as Array<unknown>)[i]
            out.push({
              type: f.type,
              value: typeof x === "string" ? x.slice(0, f.length) : x,
              byteLength,
            })
            offset += byteLength
          }
        } else {
          // schema
          for (let i = 0; i < (value as Array<unknown>).length; i++) {
            offset = flatten(out, f as Schema, (value as any)[i], offset)
          }
        }
      } else {
        // schema
        offset = flatten(
          out,
          (field as any) as Schema,
          value as SchemaInstance<Schema>,
          offset,
        )
      }
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
        if (Array.isArray(field)) {
          const f = field[0]
          const length = uint16.read(bufferView, offset, 0)
          const arr = new Array(length) as any

          out[prop] = arr
          offset += uint16.byteLength

          if ("byteLength" in f) {
            // view (leaf)
            for (let i = 0; i < length; i++) {
              arr[i] = f.type.read(bufferView, offset, f.length || 0) as any
              offset += f.type.byteLength * (f.length || 1)
            }
          } else {
            // schema
            for (let i = 0; i < length; i++) {
              const map = {} as any
              arr[i] = map
              inner(map, f)
            }
          }
        } else {
          const map = {} as any
          out[prop] = map
          inner(map, field as any)
        }
      }
    }
  }

  inner(out, schema)

  return out
}
