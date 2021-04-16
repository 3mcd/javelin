import { Schema, InstanceOfSchema } from "@javelin/model"
import { $type } from "./internal/symbols"

export type ComponentType<S extends Schema = Schema> = {
  [$type]: number
} & S

export type ComponentProps = {
  readonly __type__: number
}

export type ComponentOf<C extends ComponentType> = C extends ComponentType<
  infer S
>
  ? ComponentProps & InstanceOfSchema<Omit<C, typeof $type>>
  : never

export type Component = ComponentOf<ComponentType>

export type ComponentsOf<C extends ComponentType[]> = {
  [K in keyof C]: C[K] extends ComponentType ? ComponentOf<C[K]> : never
}
