import { Component, ComponentOf, ComponentType } from "../component"
import { createStackPool } from "../pool/stack_pool"
import {
  initializeComponentFromSchema,
  resetComponentFromSchema,
} from "../schema/schema_utils"
import { $detached } from "../symbols"

export function createComponentType<C extends ComponentType>(componentType: C) {
  return componentType
}

export function createComponentPool<C extends ComponentType>(
  componentType: C,
  poolSize: number,
) {
  const pool = createStackPool<ComponentOf<C>>(
    () =>
      initializeComponentFromSchema(
        { [$detached]: false, type: componentType.type, _v: 0 },
        componentType.schema,
      ) as ComponentOf<C>,
    c => resetComponentFromSchema(c, componentType.schema) as ComponentOf<C>,
    poolSize,
  )

  return pool
}

export function isComponentOf<T extends ComponentType>(
  component: Component,
  componentTypeId: T,
): component is ComponentOf<T> {
  return component.type === componentTypeId.type
}
