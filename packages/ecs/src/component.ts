import { PropsOfSchema, Schema } from "./schema/schema_types"

export type ComponentProps = Record<string, unknown>

export type ComponentInitializer<S extends Schema> = (
  component: Component<PropsOfSchema<S>>,
  ...args: any[]
) => void

export type ComponentInitializerArgs<
  C extends ComponentType
> = C extends ComponentType<infer S, infer I>
  ? I extends (component: ComponentOf<C>, ...args: infer A) => void
    ? A
    : never
  : never

export type ComponentType<
  S extends Schema = Schema,
  I extends ComponentInitializer<S> = any
> = {
  name?: string
  type: number
  schema: S
  initialize?: I
}

export type ComponentBase = {
  readonly _tid: number
}

export type Component<
  P extends ComponentProps = ComponentProps
> = ComponentBase & P

export type ComponentOf<C extends ComponentType> = C extends ComponentType<
  infer S
>
  ? Component<PropsOfSchema<S>>
  : never

export type ComponentsOf<C extends ComponentType[]> = {
  [K in keyof C]: C[K] extends ComponentType ? ComponentOf<C[K]> : never
}
