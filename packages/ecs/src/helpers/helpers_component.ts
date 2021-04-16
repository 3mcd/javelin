import { initialize, InstanceOfSchema, reset } from "@javelin/model"
import { Component, ComponentOf, ComponentType } from "../component"
import { $type } from "../internal/symbols"
import { createStackPool } from "../pool/stack_pool"

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

export function isComponentOf<T extends ComponentType>(
  component: Component,
  componentTypeId: T,
): component is ComponentOf<T> {
  return component.__type__ === componentTypeId[$type]
}
