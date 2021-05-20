import {
  DataType,
  InstanceOfSchema,
  InstanceOfSchemaKey,
  Schema,
  SchemaKeyKind,
} from "./model"
import { mutableEmpty } from "./utils"

export function initialize<S extends Schema>(
  object: InstanceOfSchema<S>,
  schema: S,
): InstanceOfSchema<S> {
  for (const prop in schema) {
    const schemaKey = schema[prop]
    let value: unknown
    switch (schemaKey.__kind__) {
      case SchemaKeyKind.Primitive:
        value = (schemaKey as DataType).create()
        break
      case SchemaKeyKind.Array:
        value = []
        break
      case SchemaKeyKind.Object:
        value = {}
        break
      case SchemaKeyKind.Set:
        value = new Set()
        break
      case SchemaKeyKind.Map:
        value = new Map()
        break
      default:
        value = initialize({}, schemaKey as Schema)
        break
    }
    object[prop] = value as InstanceOfSchemaKey<any>
  }
  return object
}

export function reset<S extends Schema>(
  object: InstanceOfSchema<S>,
  schema: S,
) {
  for (const prop in schema) {
    const schemaKey = schema[prop]
    switch (schemaKey.__kind__) {
      case SchemaKeyKind.Primitive:
        ;(schemaKey as DataType).reset(object, prop, undefined)
        break
      case SchemaKeyKind.Array:
        mutableEmpty(object[prop])
        break
      case SchemaKeyKind.Object: {
        const child = object[prop]
        for (const childProp in child) delete object[childProp]
        break
      }
      case SchemaKeyKind.Set:
      case SchemaKeyKind.Map:
        object[prop].clear()
        break
      default:
        reset(object[prop], schemaKey as Schema)
        break
    }
  }
  return object
}
