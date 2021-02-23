import {
  Component,
  ComponentOf,
  ComponentType,
  ComponentState,
  ComponentBase,
} from "../component"
import { createStackPool } from "../pool/stack_pool"
import {
  initializeComponentFromSchema,
  resetComponentFromSchema,
} from "../schema/schema_utils"

export function createComponentType<C extends ComponentType>(componentType: C) {
  return componentType
}

export function createComponentBase(
  componentType: ComponentType,
): ComponentBase {
  return Object.defineProperties(
    {},
    {
      tid: { value: componentType.type, writable: false, enumerable: true },
      cst: {
        value: ComponentState.Initialized,
        writable: true,
        enumerable: false,
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
      initializeComponentFromSchema(
        createComponentBase(componentType),
        componentType.schema,
      ) as ComponentOf<C>,
    c => resetComponentFromSchema(c, componentType.schema) as ComponentOf<C>,
    poolSize,
  )

  return componentPool
}

export function isComponentOf<T extends ComponentType>(
  component: Component,
  componentTypeId: T,
): component is ComponentOf<T> {
  return component.tid === componentTypeId.type
}

export function flagComponent(component: Component, state: ComponentState) {
  component.cst = state
}
