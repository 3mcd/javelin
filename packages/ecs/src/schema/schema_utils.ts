import { Component } from "../component"
import { $isDataType } from "../symbols"
import { DataType, PropsOfSchema, Schema, SchemaKey } from "./schema_types"

export function createDataType<T>(
  config: Omit<DataType<T>, typeof $isDataType>,
): DataType<T> {
  return { ...config, [$isDataType]: true }
}

export function isDataType(obj: any): obj is DataType<any> {
  return typeof obj === "object" && obj !== null && obj[$isDataType]
}

export function initializeComponentFromSchema<S extends Schema>(
  component: Component,
  schema: S,
): PropsOfSchema<S> {
  for (const prop in schema) {
    const value = schema[prop] as SchemaKey

    if (isDataType(value)) {
      // DataType
      component[prop] = value.create(undefined)
    } else if ("type" in value && isDataType(value.type)) {
      // DataType with defaultValue
      const { type, defaultValue } = value

      component[prop] = type.create(defaultValue)
    } else {
      // Schema
      initializeComponentFromSchema(component, value as Schema)
    }
  }

  return component as PropsOfSchema<S>
}

export function resetComponentFromSchema<S extends Schema>(
  component: Component,
  schema: S,
) {
  for (const prop in schema) {
    const value = schema[prop] as SchemaKey

    if (isDataType(value)) {
      // DataType
      value.reset(component, prop, undefined)
    } else if ("type" in value && isDataType(value.type)) {
      // DataType with defaultValue
      const { type, defaultValue } = value

      ;(type as DataType<unknown>).reset(component, prop, defaultValue)
    } else {
      // Schema
      resetComponentFromSchema(component, value as Schema)
    }
  }

  return component as PropsOfSchema<S>
}

export type SerializedSchema<S extends Schema = Schema> = S extends DataType<
  infer T
>
  ? T
  : {
      [K in keyof S]: S[K] extends Schema
        ? SerializedSchema<S>
        : S[K] extends DataType<any>
        ? S[K]["name"]
        : never
    }

export function serializeSchema<S extends Schema>(
  schema: S,
): SerializedSchema<S> {
  const out: any = {}

  for (const prop in schema) {
    const value = schema[prop] as SchemaKey

    if (isDataType(value)) {
      out[prop] = value.name
    } else if ("type" in value && isDataType(value.type)) {
      out[prop] = value.type.name
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
    const value = schema[prop] as SchemaKey

    if (isDataType(value)) {
      if (serializedSchema[prop] !== value.name) {
        return false
      }
    } else if ("type" in value && isDataType(value.type)) {
      if (serializedSchema[prop] !== value.type.name) {
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
