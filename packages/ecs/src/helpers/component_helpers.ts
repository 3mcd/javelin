import {
  Component,
  ComponentBase,
  ComponentOf,
  ComponentState,
  ComponentType,
  InternalComponent,
} from "../component"
import { createStackPool } from "../pool/stack_pool"
import {
  initializeComponentFromSchema,
  resetComponentFromSchema,
  SerializedSchema,
  serializeSchema,
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
      _tid: { value: componentType.type, writable: false, enumerable: true },
      _cst: {
        value: ComponentState.Orphaned,
        writable: true,
        enumerable: false,
      },
    },
  )
}

export type SerializedComponentType<C extends ComponentType = ComponentType> = {
  name: C["name"]
  type: C["type"]
  schema: SerializedSchema<C["schema"]>
}

export function serializeComponentType(
  componentType: ComponentType,
): SerializedComponentType {
  return {
    name: componentType.name,
    type: componentType.type,
    schema: serializeSchema(componentType.schema),
  }
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
  return component._tid === componentTypeId.type
}

export function flagComponent(component: Component, state: ComponentState) {
  ;(component as InternalComponent)._cst = state
}

export function flagComponents(
  components: readonly Component[],
  state: ComponentState,
) {
  for (let i = 0; i < components.length; i++) {
    flagComponent(components[i], state)
  }
}
