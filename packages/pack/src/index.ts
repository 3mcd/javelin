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

export function flatten<S extends Schema>(
  out: BufferField[],
  schema: S,
  data: SchemaInstance<S>,
  offset = 0,
) {
  if (Array.isArray(schema)) {
    const fieldOrSchema = schema[0]

    out.push({
      type: uint32,
      value: ((data as unknown) as Array<unknown>).length,
      byteLength: uint32.byteLength,
    })

    offset += uint32.byteLength

    if (isField(fieldOrSchema)) {
      const byteLength =
        fieldOrSchema.type.byteLength * (fieldOrSchema.length || 1)
      for (let i = 0; i < ((data as unknown) as Array<unknown>).length; i++) {
        const value = ((data as unknown) as Array<unknown>)[i]
        out.push({
          type: fieldOrSchema.type,
          value:
            typeof value === "string"
              ? value.slice(0, fieldOrSchema.length)
              : value,
          byteLength,
        })
        offset += byteLength
      }
    } else {
      for (let i = 0; i < ((data as unknown) as Array<unknown>).length; i++) {
        offset = flatten(out, fieldOrSchema as Schema, (data as any)[i], offset)
      }
    }
  } else {
    for (const prop in schema) {
      const fieldOrSchema = schema[prop]
      const value = data[prop]

      if (isField(fieldOrSchema)) {
        const byteLength =
          fieldOrSchema.type.byteLength * (fieldOrSchema.length || 1)
        out.push({
          type: fieldOrSchema.type,
          value:
            typeof value === "string"
              ? value.slice(0, fieldOrSchema.length)
              : value,
          byteLength,
        })
        offset += byteLength
      } else {
        offset = flatten(
          out,
          (fieldOrSchema as unknown) as Schema,
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
  const bufferView = new DataView(buffer)

  let offset = 0

  const build = (schema: Schema) => {
    let result: any

    if (Array.isArray(schema)) {
      const fieldOrSchema = schema[0]
      const length = uint32.read(bufferView, offset, 0)

      offset += uint32.byteLength

      result = []

      if (isField(fieldOrSchema)) {
        for (let i = 0; i < length; i++) {
          result[i] = fieldOrSchema.type.read(
            bufferView,
            offset,
            fieldOrSchema.length || 0,
          )
          offset += fieldOrSchema.type.byteLength * (fieldOrSchema.length || 1)
        }
      } else {
        for (let i = 0; i < length; i++) {
          result[i] = build(fieldOrSchema)
        }
      }
    } else {
      result = {}

      for (const prop in schema) {
        const fieldOrSchema = schema[prop]

        if (isField(fieldOrSchema)) {
          result[prop] = fieldOrSchema.type.read(
            bufferView,
            offset,
            fieldOrSchema.length || 0,
          )
          offset += fieldOrSchema.type.byteLength * (fieldOrSchema.length || 1)
        } else {
          result[prop] = build(fieldOrSchema)
        }
      }
    }

    return result
  }

  return build(schema)
}

export * from "./views"
