import {
  Component,
  ComponentOf,
  ComponentType,
  MutableComponentOf,
} from "../component"
import { createStackPool } from "../pool/stack_pool"
import { Schema } from "../schema/schema_types"
import {
  initializeComponentFromSchema,
  resetComponentFromSchema,
} from "../schema/schema_utils"
import { noop } from "../util/fp"

export function createComponentType<T extends number, S extends Schema>(
  name: string,
  type: T,
  schema: S,
): ComponentType<T, S> {
  return { name, type, schema }
}

export function createComponentPool<C extends ComponentType>(componentType: C) {
  const pool = createStackPool<ComponentOf<C>>(
    () =>
      initializeComponentFromSchema(
        { _t: componentType.type, _v: 0 },
        componentType.schema,
      ) as ComponentOf<C>,
    c => resetComponentFromSchema(c, componentType.schema) as ComponentOf<C>,
    1000,
  )

  return pool
}

type ComponentInitializer<C extends ComponentType> = (
  component: MutableComponentOf<C>,
  ...args: any[]
) => void

export type ComponentInitializerArgs<I, C extends ComponentType> = I extends (
  component: ComponentOf<C>,
  ...args: infer A
) => void
  ? A
  : never[]

export type ComponentFactoryLike<
  C extends ComponentType = ComponentType,
  I extends ComponentInitializer<C> = ComponentInitializer<C>
> = {
  name: string
  create(...args: ComponentInitializerArgs<I, C>): ComponentOf<C>
  destroy(component: ComponentOf<C>): void
} & C

export function createComponentFactory<
  C extends ComponentType,
  I extends ComponentInitializer<C>
>(
  componentType: C,
  componentInitializer: I = noop as I,
): ComponentFactoryLike<C, I> {
  const pool = createComponentPool(componentType)

  return {
    create(...args: ComponentInitializerArgs<I, C>) {
      const component = pool.retain()
      componentInitializer(component, ...args)
      return component
    },
    destroy(component: ComponentOf<C>) {
      pool.release(component)
    },
    ...componentType,
  }
}

export function isComponentOf<T extends ComponentType>(
  component: Component,
  componentTypeId: T,
): component is ComponentOf<T> {
  return component._t === componentTypeId.type
}
