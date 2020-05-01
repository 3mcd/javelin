import { AnySchema, Schema, PropsOfSchema } from "./schema/schema_types"
import { Mutable } from "./types"

export type ComponentProps = { [key: string]: unknown }

export type ComponentSpec<
  T extends number = number,
  S extends Schema = AnySchema
> = {
  type: T
  schema: S
}

export type Component<
  T extends number = number,
  P extends ComponentProps = ComponentProps
> = {
  _t: T
  _v: number
  _e: number
} & P

export type ComponentOf<C extends ComponentSpec> = C extends ComponentSpec<
  infer T,
  infer S
>
  ? Readonly<Component<T, PropsOfSchema<S>>>
  : never

export type ComponentsOf<C extends ComponentSpec[]> = {
  [K in keyof C]: C[K] extends ComponentSpec ? ComponentOf<C[K]> : never
}

export type MutableComponentOf<C extends ComponentSpec> = Mutable<
  ComponentOf<C>
>
