import {
  assert,
  initialize,
  InstanceOfSchema,
  reset,
  Schema,
} from "@javelin/model"
import { $type } from "./internal/symbols"
import { createStackPool, StackPool } from "./pool"

export type ComponentType<S extends Schema = Schema> = {
  [$type]: number
} & S

export type ComponentProps = {
  readonly __type__: number
}

export type ComponentOf<C extends ComponentType> = C extends ComponentType<
  infer S
>
  ? ComponentProps & InstanceOfSchema<Omit<C, typeof $type>>
  : never

export type Component = ComponentOf<ComponentType>

export type ComponentsOf<C extends ComponentType[]> = {
  [K in keyof C]: C[K] extends ComponentType ? ComponentOf<C[K]> : never
}

let nextComponentTypeId = 0

export function createComponentBase<C extends ComponentType>(
  componentType: C,
): ComponentOf<C> {
  return Object.defineProperties(
    {},
    {
      __type__: {
        value: componentType[$type],
        writable: false,
        enumerable: true,
      },
    },
  )
}

export function isComponentOf<T extends ComponentType>(
  component: Component,
  componentTypeId: T,
): component is ComponentOf<T> {
  return component.__type__ === componentTypeId[$type]
}

export const componentTypes: ComponentType[] = []
export const componentTypeIds = new Set<number>()
export const componentTypePools = new Map<number, StackPool<Component>>()

export function createComponentPool<C extends ComponentType>(
  componentType: C,
  poolSize: number,
) {
  const componentPool = createStackPool<ComponentOf<C>>(
    () =>
      initialize(
        createComponentBase(componentType) as InstanceOfSchema<C>,
        componentType,
      ) as ComponentOf<C>,
    component =>
      reset(component as InstanceOfSchema<C>, componentType) as ComponentOf<C>,
    poolSize,
  )

  return componentPool
}

export const registerComponentType = (
  componentType: ComponentType,
  componentTypeId?: number,
  poolSize = 1000,
) => {
  let type: number | undefined = componentType[$type]

  if (type !== undefined) {
    return type
  }

  type = componentTypeId

  if (type === undefined) {
    while (componentTypeIds.has(nextComponentTypeId++));
    type = componentType[$type] = nextComponentTypeId
    componentTypeIds.add(type)
  }

  assert(
    componentTypes.find(
      ({ [$type]: type }) => componentType[$type] === type,
    ) === undefined,
    "Failed to register component type: a component with same id is already registered",
  )

  componentTypes.push(componentType)
  componentTypePools.set(type, createComponentPool(componentType, poolSize))

  return type
}

export const component = <C extends ComponentType>(
  componentType: C,
): ComponentOf<C> => {
  registerComponentType(componentType)

  const pool = componentTypePools.get(componentType[$type]) as StackPool<
    ComponentOf<C>
  >

  return pool.retain()
}
