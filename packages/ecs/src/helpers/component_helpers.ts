import {
  Component,
  ComponentOf,
  ComponentSpec,
  MutableComponentOf,
} from "../component"
import { createStackPool } from "../pool/stack_pool"
import { Schema } from "../schema/schema_types"
import {
  initializeComponentFromSchema,
  resetComponentFromSchema,
} from "../schema/schema_utils"
import { noop } from "../util/fp"
import { Storage } from "../storage"
import { Mutable } from "../types"

export function createComponentSpec<T extends number, S extends Schema>(
  type: T,
  schema: S,
): ComponentSpec<T, S> {
  return { type, schema }
}

export function createComponentPool<C extends ComponentSpec>(componentSpec: C) {
  const pool = createStackPool<ComponentOf<C>>(
    () =>
      initializeComponentFromSchema(
        { _t: componentSpec.type, _v: 0 },
        componentSpec.schema,
      ) as ComponentOf<C>,
    c => resetComponentFromSchema(c, componentSpec.schema) as ComponentOf<C>,
    1000,
  )

  return pool
}

type ComponentInitializer<C extends ComponentSpec> = (
  component: MutableComponentOf<C>,
  ...args: any[]
) => void

export type ComponentInitializerArgs<I> = I extends (
  component: Component,
  ...args: infer A
) => unknown
  ? A
  : never

interface ComponentFactoryLike<
  C extends ComponentSpec,
  I extends ComponentInitializer<C>
> {
  create(...args: ComponentInitializerArgs<I>): ComponentOf<C>
  destroy(component: ComponentOf<C>): void
}

export function createComponentFactory<
  C extends ComponentSpec,
  I extends ComponentInitializer<C>
>(
  componentSpec: C,
  componentInitializer: I = noop as I,
): C & ComponentFactoryLike<C, I> {
  const pool = createComponentPool(componentSpec)

  return {
    create(...args: ComponentInitializerArgs<I>) {
      const component = pool.retain()
      componentInitializer(component, ...args)
      return component
    },
    destroy(component: ComponentOf<C>) {
      pool.release(component)
    },
    ...componentSpec,
  }
}

export function isComponentOf(
  component: Component,
  componentType: ComponentSpec,
): component is ComponentOf<ComponentSpec> {
  return component._t === componentType.type
}
