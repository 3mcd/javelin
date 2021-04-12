import { Schema, InstanceOfSchema, isPrimitiveType, DataType } from "./model"

export function initialize<S extends Schema>(
  component: InstanceOfSchema<S>,
  schema: S,
): InstanceOfSchema<S> {
  for (const prop in schema) {
    const value = schema[prop]

    if (isPrimitiveType(value)) {
      component[prop] = value.create()
    } else {
      initialize(component, value as Schema)
    }
  }

  return component
}

export function reset<S extends Schema>(
  component: InstanceOfSchema<S>,
  schema: S,
) {
  for (const prop in schema) {
    const value = schema[prop]

    if (isPrimitiveType(value)) {
      value.reset(component, prop, undefined)
    } else {
      reset(component, value as Schema)
    }
  }

  return component
}

export type SerializedSchema<S extends Schema = Schema> = {
  [K in keyof S]: S[K] extends Schema
    ? SerializedSchema<S>
    : S[K] extends DataType<any>
    ? S[K]["__type__"]
    : never
}

export function serializeSchema<S extends Schema>(
  schema: S,
): SerializedSchema<S> {
  const out: any = {}

  for (const prop in schema) {
    const value = schema[prop]

    if (isPrimitiveType(value)) {
      out[prop] = value.__type__
    } else {
      out[prop] = serializeSchema(value as Schema)
    }
  }

  return out as SerializedSchema<S>
}

export function schemaEqualsSerializedSchema(
  schema: Schema,
  serializedSchema: SerializedSchema,
) {
  if (Object.keys(schema).length !== Object.keys(serializedSchema).length) {
    return false
  }

  for (const prop in schema) {
    const value = schema[prop]

    if (isPrimitiveType(value)) {
      if (serializedSchema[prop] !== value.__type__) {
        return false
      }
    } else {
      const result = schemaEqualsSerializedSchema(
        value as Schema,
        serializedSchema[prop],
      )

      if (!result) {
        return false
      }
    }
  }

  return true
}
