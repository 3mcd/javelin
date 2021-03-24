import {
  Component,
  ComponentBase,
  ComponentInitializer,
  ComponentOf,
  ComponentType,
} from "../component"
import { createStackPool } from "../pool/stack_pool"
import { Schema } from "../schema"
import {
  initializeComponentFromSchema,
  resetComponentFromSchema,
  SerializedSchema,
  serializeSchema,
} from "../schema/schema_utils"

type CreateComponentTypeOptions<
  S extends Schema,
  I extends ComponentInitializer<S>
> = Pick<ComponentType<S, I>, "type" | "initialize"> & {
  schema?: S
}

export function createComponentType<
  S extends Schema = {},
  I extends ComponentInitializer<S> = ComponentInitializer<S>
>(options: CreateComponentTypeOptions<S, I>): ComponentType<S, I> {
  return {
    ...options,
    schema: options.schema || ({} as S),
  }
}

export function createComponentBase(
  componentType: ComponentType,
): ComponentBase {
  return Object.defineProperties(
    {},
    {
      _tid: { value: componentType.type, writable: false, enumerable: true },
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
