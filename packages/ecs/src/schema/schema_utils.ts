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
  component: any,
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
  component: any,
  schema: S,
) {
  delete component._v

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
