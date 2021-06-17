import {
  createModel,
  createStackPool,
  FieldExtract,
  createSchemaInstance,
  resetSchemaInstance,
  Schema,
  StackPool,
} from "@javelin/core"
import { UNSAFE_internals, UNSAFE_setModel } from "./internal"

type ComponentProps = {
  readonly __type__: number
}

export type ComponentOf<S extends Schema> = ComponentProps & FieldExtract<S>
export type ComponentsOf<C extends Schema[]> = {
  [K in keyof C]: C[K] extends Schema ? ComponentOf<C[K]> : never
}
export type Component = ComponentOf<Schema>

let schemaIds = 0

function createComponentBase<S extends Schema>(schema: S): ComponentOf<S> {
  return Object.defineProperties(
    {},
    {
      __type__: {
        value: UNSAFE_internals.schemaIndex.get(schema),
        writable: false,
        enumerable: true,
      },
    },
  ) as ComponentOf<S>
}

/**
 * Determine if a component is an instance of the specified component type.
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
  return component.__type__ === UNSAFE_internals.schemaIndex.get(schema)
}

export function createComponentPool<S extends Schema>(
  Schema: S,
  poolSize: number,
) {
  const componentPool = createStackPool<ComponentOf<S>>(
    () =>
      createSchemaInstance(
        Schema,
        createComponentBase(Schema) as FieldExtract<S>,
      ) as ComponentOf<S>,
    component =>
      resetSchemaInstance(
        component as FieldExtract<S>,
        Schema,
      ) as ComponentOf<S>,
    poolSize,
  )

  return componentPool
}

const modelConfig = new Map<number, Schema>()

/**
 * Manually register a Schema as a component type. Optionally specify an id and
 * size for the component type's object pool.
 * @param schema
 * @param schemaId
 * @param [poolSize=1000]
 * @returns
 * @example <caption>register a schema as a component type</caption>
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
) {
  let type: number | undefined = UNSAFE_internals.schemaIndex.get(schema)
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
  UNSAFE_internals.schemaPools.set(type, createComponentPool(schema, poolSize))
  modelConfig.set(type, schema)
  UNSAFE_internals.schemaIndex.set(schema, type)
  UNSAFE_setModel(createModel(modelConfig))
  return type
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
 * const q = component(Quaternion, { w: 1 })
 * ```
 */
export function component<S extends Schema>(
  schema: S,
  props?: Partial<FieldExtract<S>>,
): ComponentOf<S> {
  const type = registerSchema(schema)
  const instance = (
    UNSAFE_internals.schemaPools.get(type) as StackPool<ComponentOf<S>>
  ).retain()
  if (props !== undefined) {
    Object.assign(instance, props)
  }
  return instance
}
