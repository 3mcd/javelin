import { AnySchema, Schema, PropsOfSchema } from "./schema/schema_types"
import { Mutable } from "./types"

export type ComponentProps = { [key: string]: unknown }

export type ComponentInitializer<T extends number, S extends Schema> = (
  component: Component<T, PropsOfSchema<S>>,
  ...args: any[]
) => void

export type ComponentInitializerArgs<
  C extends ComponentType
> = C extends ComponentType<infer T, infer S, infer I>
  ? I extends (component: ComponentOf<C>, ...args: infer A) => void
    ? A
    : never
  : never

export type ComponentType<
  T extends number = number,
  S extends Schema = AnySchema,
  I extends ComponentInitializer<T, S> = ComponentInitializer<T, S>
> = {
  name?: string
  type: T
  schema: S
  initialize?: I
}

export type Component<
  T extends number = number,
  P extends ComponentProps = ComponentProps
> = {
  _t: T
  _v: number
} & P

export type ComponentSpec<
  T extends number = number,
  P extends ComponentProps = ComponentProps
> = {
  _t: T
} & P

export type ComponentOf<C extends ComponentType> = C extends ComponentType<
  infer T,
  infer S
>
  ? Component<T, PropsOfSchema<S>>
  : never

export type ComponentsOf<C extends ComponentType[]> = {
  [K in keyof C]: C[K] extends ComponentType
    ? Readonly<ComponentOf<C[K]>>
    : never
}

export type MutableComponentOf<C extends ComponentType> = Mutable<
  ComponentOf<C>
>
