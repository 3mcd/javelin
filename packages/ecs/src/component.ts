import {
  createModel,
  createStackPool,
  initialize,
  InstanceOfSchema,
  reset,
  Schema,
  StackPool,
} from "@javelin/model"
import { setModel } from "./internal"
import { $componentType } from "./internal/symbols"

export type ComponentType<S extends Schema = Schema> = {
  [$componentType]: number
} & S

export type ComponentProps = {
  readonly __type__: number
}

export type ComponentOf<S extends Schema> = ComponentProps & InstanceOfSchema<S>
export type Component = ComponentOf<Schema>

export type ComponentsOf<C extends Schema[]> = {
  [K in keyof C]: C[K] extends Schema ? ComponentOf<C[K]> : never
}

let nextComponentTypeId = 0

export function createComponentBase<C extends ComponentType>(
  componentType: C,
): ComponentOf<C> {
  return Object.defineProperties(
    {},
    {
      __type__: {
        value: componentType[$componentType],
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
  return component.__type__ === componentTypeId[$componentType]
}

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

const modelConfig = new Map<number, ComponentType>()

export function registerComponentType(
  componentType: ComponentType | Schema,
  componentTypeId?: number,
  poolSize = 1000,
): asserts componentType is ComponentType {
  let type: number | undefined = Reflect.get(componentType, $componentType)

  if (type !== undefined) {
    return
  }

  type = componentTypeId

  if (type === undefined) {
    while (modelConfig.has(nextComponentTypeId)) {
      nextComponentTypeId++
    }
    type = (componentType as ComponentType)[
      $componentType
    ] = nextComponentTypeId
  } else if (modelConfig.has(type)) {
    throw new Error(
      "Failed to register component type: a component with same id is already registered",
    )
  }

  componentTypePools.set(
    type,
    createComponentPool(componentType as ComponentType, poolSize),
  )
  modelConfig.set(type, componentType as ComponentType)

  setModel(createModel(modelConfig))
}

export const component = <S extends Schema>(
  componentType: S,
): ComponentOf<S> => {
  registerComponentType(componentType)
  return (componentTypePools.get(componentType[$componentType]) as StackPool<
    ComponentOf<S>
  >).retain()
}
