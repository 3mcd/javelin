import {
  InstanceOfSchema,
  InstanceOfSchemaKey,
  isArrayType,
  isObjectType,
  isPrimitiveType,
  Schema,
  SchemaKeyKind,
} from "./model"
import { mutableEmpty } from "./utils"

export function initialize<S extends Schema>(
  object: InstanceOfSchema<S>,
  schema: S,
): InstanceOfSchema<S> {
  for (const prop in schema) {
    const value = schema[prop]

    if (isPrimitiveType(value)) {
      object[prop] = value.create()
    } else if (value.__kind__ === SchemaKeyKind.Array) {
      object[prop] = [] as InstanceOfSchemaKey<any>
    } else if (value.__kind__ === SchemaKeyKind.Object) {
      object[prop] = {} as InstanceOfSchemaKey<any>
    } else {
      object[prop] = initialize({}, value as Schema) as InstanceOfSchemaKey<any>
    }
  }

  return object
}

export function reset<S extends Schema>(
  object: InstanceOfSchema<S>,
  schema: S,
) {
  for (const prop in schema) {
    const value = schema[prop]

    if (isPrimitiveType(value)) {
      value.reset(object, prop, undefined)
    } else if (isArrayType(value)) {
      mutableEmpty(object[prop])
    } else if (isObjectType(value)) {
      const child = object[prop]
      for (const childProp in child) {
        delete object[childProp]
      }
    } else {
      reset(object[prop], value as Schema)
    }
  }

  return object
}
