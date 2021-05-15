import {
  createModel,
  createStackPool,
  initialize,
  InstanceOfSchema,
  reset,
  Schema,
  StackPool,
} from "@javelin/core"
import { UNSAFE_internals } from "./internal"

export type ComponentProps = {
  readonly __type__: number
}

export type ComponentOf<S extends Schema> = ComponentProps & InstanceOfSchema<S>
export type Component = ComponentOf<Schema>

export type ComponentsOf<C extends Schema[]> = {
  [K in keyof C]: C[K] extends Schema ? ComponentOf<C[K]> : never
}

let nextSchemaId = 0

export function createComponentBase<S extends Schema>(
  schema: S,
): ComponentOf<S> {
  return Object.defineProperties(
    {},
    {
      __type__: {
        value: UNSAFE_internals.componentTypeIndex.get(schema),
        writable: false,
        enumerable: true,
      },
    },
  )
}

export function isComponentOf<S extends Schema>(
  component: Component,
  schema: S,
): component is ComponentOf<S> {
  return component.__type__ === UNSAFE_internals.componentTypeIndex.get(schema)
}

export const componentTypePools = new Map<number, StackPool<Component>>()

export function createComponentPool<S extends Schema>(
  Schema: S,
  poolSize: number,
) {
  const componentPool = createStackPool<ComponentOf<S>>(
    () =>
      initialize(
        createComponentBase(Schema) as InstanceOfSchema<S>,
        Schema,
      ) as ComponentOf<S>,
    component =>
      reset(component as InstanceOfSchema<S>, Schema) as ComponentOf<S>,
    poolSize,
  )

  return componentPool
}

const modelConfig = new Map<number, Schema>()

export function registerSchema(
  schema: Schema,
  schemaId?: number,
  poolSize = 1000,
) {
  let type: number | undefined = UNSAFE_internals.componentTypeIndex.get(schema)
  if (type !== undefined) {
    return type
  }
  type = schemaId
  if (type === undefined) {
    while (modelConfig.has(nextSchemaId)) {
      nextSchemaId++
    }
    type = nextSchemaId
  } else if (modelConfig.has(type)) {
    throw new Error(
      "Failed to register component type: a component with same id is already registered",
    )
  }
  componentTypePools.set(type, createComponentPool(schema, poolSize))
  modelConfig.set(type, schema)
  UNSAFE_internals.componentTypeIndex.set(schema, type)
  UNSAFE_internals.model = createModel(modelConfig)
  return type
}

export const component = <S extends Schema>(
  schema: S,
  props?: Partial<InstanceOfSchema<S>>,
): ComponentOf<S> => {
  const type = registerSchema(schema)
  const instance = (componentTypePools.get(type) as StackPool<
    ComponentOf<S>
  >).retain()
  if (props !== undefined) {
    Object.assign(instance, props)
  }
  return instance
}
