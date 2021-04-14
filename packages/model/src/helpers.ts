import { mutableEmpty } from "@javelin/ecs"
import {
  InstanceOfSchema,
  InstanceOfSchemaKey,
  isArrayType,
  isPrimitiveType,
  Schema,
  SchemaKeyKind,
} from "./model"

export function initialize<S extends Schema>(
  component: InstanceOfSchema<S>,
  schema: S,
): InstanceOfSchema<S> {
  for (const prop in schema) {
    const value = schema[prop]

    if (isPrimitiveType(value)) {
      component[prop] = value.create()
    } else if (value.__kind__ === SchemaKeyKind.Array) {
      component[prop] = [] as InstanceOfSchemaKey<any>
    } else {
      component[prop] = initialize(
        {},
        value as Schema,
      ) as InstanceOfSchemaKey<any>
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
    } else if (isArrayType(value)) {
      mutableEmpty((value as unknown) as any[])
    } else {
      reset(component[prop], value as Schema)
    }
  }

  return component
}
