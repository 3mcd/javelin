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

export type InternalComponentProps = {
  [$type]: number
  [$pool]: boolean
}
export type ComponentProps = {
  readonly [K in keyof InternalComponentProps]: InternalComponentProps[K]
}

export type ComponentOf<S extends Schema> = FieldExtract<S>
export type ComponentsOf<C extends Schema[]> = {
  [K in keyof C]: C[K] extends Schema ? ComponentOf<C[K]> : never
}
export type Component = ComponentOf<Schema>

const { schemaIndex, schemaPools, instanceTypeLookup } = UNSAFE_internals

let schemaIds = 0

function createComponentBase<S extends Schema>(
  schema: S,
  pool = true,
): ComponentOf<S> {
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
  ) as ComponentOf<S>
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
export function isComponentOf<S extends Schema>(
  component: Component,
  schema: S,
): component is ComponentOf<S> {
  return getComponentId(component) === schemaIndex.get(schema)
}

export function createComponentPool<S extends Schema>(
  schema: S,
  poolSize: number,
) {
  const componentPool = createStackPool<ComponentOf<S>>(
    () =>
      createSchemaInstance(
        schema,
        createComponentBase(schema) as FieldExtract<S>,
      ) as ComponentOf<S>,
    component =>
      resetSchemaInstance(
        component as FieldExtract<S>,
        schema,
      ) as ComponentOf<S>,
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

function createComponentInner<S extends Schema>(schema: S): ComponentOf<S> {
  const type = registerSchema(schema)
  const pool = UNSAFE_internals.schemaPools.get(type)
  return (
    pool
      ? pool.retain()
      : createSchemaInstance(schema, createComponentBase(schema, false))
  ) as ComponentOf<S>
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
export function component<S extends Schema>(
  schema: S,
  props?: Partial<FieldExtract<S>>,
): ComponentOf<S> {
  const instance = createComponentInner(schema)
  if (props !== undefined) {
    Object.assign(instance, props)
  }
  return instance
}

/**
 * Instruct the ECS to treat an object as a component instance of a given
 * schema.
 * @param object
 * @param schema
 * @returns
 */
export function toComponent<S extends Schema>(
  object: FieldExtract<S>,
  schema: S,
): ComponentOf<S> {
  const type = registerSchema(schema, undefined, 0)
  try {
    ;(object as InternalComponentProps)[$type] = type
    ;(object as InternalComponentProps)[$pool] = false
  } catch {}
  if ((object as InternalComponentProps)[$type] !== type) {
    instanceTypeLookup.set(object as InternalComponentProps, type)
  }
  return object as ComponentOf<S>
}

/**
 * Get the type id (number) of a component. Throws an error if the object is
 * not a valid component.
 * @param component
 * @returns
 */
export function getComponentId(component: object) {
  const type =
    (component as InternalComponentProps)[$type] ??
    instanceTypeLookup.get(component)
  if (type === undefined) {
    throw new Error(
      "Failed to get component type id: object is not a component",
    )
  }
  return type
}
