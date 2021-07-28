import {
  createModel,
  createSchemaInstance,
  createStackPool,
  FieldExtract,
  resetSchemaInstance,
  Schema,
} from "@javelin/core"
import { UNSAFE_internals, UNSAFE_setModel } from "./internal"

export const $type = Symbol("javelin_component_type")
export const $pool = Symbol("javelin_component_pool")

export type ComponentMetadata = {
  [$type]?: number
  [$pool]?: boolean
}

export type ComponentOf<$Schema extends Schema> = FieldExtract<$Schema> &
  ComponentMetadata
export type ComponentsOf<$Signature extends Schema[]> = {
  [K in keyof $Signature]: $Signature[K] extends Schema
    ? ComponentOf<$Signature[K]>
    : never
}
export type Component = ComponentOf<Schema>

const { schemaIndex, schemaPools, instanceTypeLookup } = UNSAFE_internals

let schemaIds = 0

function createComponentBase<$Schema extends Schema>(
  schema: $Schema,
  pool = true,
): ComponentOf<$Schema> {
  return Object.defineProperties(
    {},
    {
      [$type]: {
        value: schemaIndex.get(schema),
        writable: false,
        enumerable: false,
      },
      [$pool]: {
        value: pool,
        writable: false,
        enumerable: false,
      },
    },
  ) as ComponentOf<$Schema>
}

/**
 * Check if a component is an instance of a component type.
 * @param component
 * @param schema
 * @returns
 * @example
 * const A = {}
 * const B = {}
 * const a = component(A)
 * isComponentOf(a, A) // true
 * isComponentOf(a, B) // false
 */
export function isComponentOf<$Schema extends Schema>(
  component: Component,
  schema: $Schema,
): component is ComponentOf<$Schema> {
  return getSchemaId(component) === schemaIndex.get(schema)
}

export function createComponentPool<$Schema extends Schema>(
  schema: $Schema,
  poolSize: number,
) {
  const componentPool = createStackPool<ComponentOf<$Schema>>(
    () =>
      createSchemaInstance(
        schema,
        createComponentBase(schema) as FieldExtract<$Schema>,
      ) as ComponentOf<$Schema>,
    component =>
      resetSchemaInstance(
        component as FieldExtract<$Schema>,
        schema,
      ) as ComponentOf<$Schema>,
    poolSize,
  )

  return componentPool
}

const modelConfig = new Map<number, Schema>()

/**
 * Manually register a component type. Optionally specify a unique, integer id
 * and/or size for the component type's object pool.
 * @param schema
 * @param schemaId
 * @param [poolSize=1000]
 * @returns
 * @example <caption>register a schema as a component type (optional)</caption>
 * ```ts
 * const Vehicle = { torque: number }
 * registerSchema(Vehicle)
 * ```
 * @example <caption>register a schema with a fixed id</caption>
 * ```ts
 * const Vehicle = { torque: number }
 * registerSchema(Vehicle, 22)
 * ```
 * @example <caption>register a schema with a fixed id and pool size</caption>
 * ```ts
 * const Particle = { color: number }
 * registerSchema(Particle, 3, 10_000)
 * ```
 */
export function registerSchema(
  schema: Schema,
  schemaId?: number,
  poolSize = 1000,
): number {
  let type: number | undefined = schemaIndex.get(schema)
  if (type !== undefined) {
    return type
  }
  type = schemaId
  if (type === undefined) {
    while (modelConfig.has(schemaIds)) {
      schemaIds++
    }
    type = schemaIds
  } else if (modelConfig.has(type)) {
    throw new Error(
      "Failed to register component type: a component with same id is already registered",
    )
  }
  if (poolSize > 0) {
    schemaPools.set(type, createComponentPool(schema, poolSize))
  }
  modelConfig.set(type, schema)
  schemaIndex.set(schema, type)
  UNSAFE_setModel(createModel(modelConfig))
  return type
}

function createComponentInner<$Schema extends Schema>(
  schema: $Schema,
): ComponentOf<$Schema> {
  const type = registerSchema(schema)
  const pool = UNSAFE_internals.schemaPools.get(type)
  return (
    pool
      ? pool.retain()
      : createSchemaInstance(schema, createComponentBase(schema, false))
  ) as ComponentOf<$Schema>
}

/**
 * Use a Schema to create a component. The second parameter is an optional
 * object that will be used to assign initial values to the new component
 * instance.
 * @param schema
 * @param props
 * @returns
 * @example
 * ```ts
 * const Quaternion = { x: number, y: number, z: number, w: number }
 * const quaternion = component(Quaternion, { w: 1 })
 * ```
 */
export function component<$Schema extends Schema>(
  schema: $Schema,
  props?: Partial<FieldExtract<$Schema>>,
): ComponentOf<$Schema> {
  const instance = createComponentInner(schema)
  if (props !== undefined) {
    Object.assign(instance, props)
  }
  return instance
}

export function toComponentFromType(object: object, type: number) {
  try {
    ;(object as ComponentMetadata)[$type] = type
    ;(object as ComponentMetadata)[$pool] = false
  } catch {}
  if ((object as ComponentMetadata)[$type] !== type) {
    instanceTypeLookup.set(object as ComponentMetadata, type)
  }
  return object as Component
}

/**
 * Instruct the ECS to treat an object as a component instance of a given
 * schema.
 * @param object
 * @param schema
 * @returns
 */
export function toComponent<$Schema extends Schema>(
  object: FieldExtract<$Schema>,
  schema: $Schema,
): ComponentOf<$Schema> {
  const type = registerSchema(schema, undefined, 0)
  return toComponentFromType(object, type) as ComponentOf<$Schema>
}

/**
 * Get the type id (number) of a component. Throws an error if the object is
 * not a valid component.
 * @param component
 * @returns
 */
export function getSchemaId(component: object) {
  const type =
    (component as ComponentMetadata)[$type] ?? instanceTypeLookup.get(component)
  if (type === undefined) {
    throw new Error(
      "Failed to get component type id: object is not a component",
    )
  }
  return type
}
