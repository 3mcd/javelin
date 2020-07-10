import { AnySchema, Schema, PropsOfSchema } from "./schema/schema_types"
import { Mutable } from "./types"

export type ComponentProps = { [key: string]: unknown }

export type ComponentType<
  T extends number = number,
  S extends Schema = AnySchema
> = {
  name: string
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
