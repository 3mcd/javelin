import {assert, expect, Opaque} from "@javelin/lib"
import {LO_MASK} from "./entity.js"
import {Express, Schema, SchemaOf} from "./schema.js"

export const Dynamic = Symbol()
export type Dynamic = typeof Dynamic

export declare const Tag: unique symbol
export type Tag = typeof Tag

export type ComponentSpec = Dynamic | Schema | Tag | unknown
export type ComponentValue<T extends ComponentSpec> =
  T extends Dynamic
    ? unknown
    : T extends Schema
    ? Express<T>
    : T extends Tag
    ? never
    : T

export type Component<T extends ComponentSpec = unknown> = Opaque<
  number,
  T
>

let componentIds = 0
let componentSchemas: (Schema | Dynamic)[] = []

export let hasSchema = (component: Component) =>
  component in componentSchemas
export let getSchema = (component: Component) =>
  componentSchemas[component]
export let setSchema = (
  component: Component,
  schema: Schema | Dynamic,
) => (componentSchemas[component] = schema)

export let expressComponent = <T>(
  component: Component<T>,
): ComponentValue<T> => {
  let schema = expect(getSchema(component))
  assert(schema !== Dynamic)
  if (typeof schema === "string") {
    return 0 as unknown as ComponentValue<T>
  }
  let value = {} as Record<string, number>
  for (let prop in schema) {
    value[prop] = 0
  }
  return value as unknown as ComponentValue<T>
}

export function makeTagComponent(): Component<Tag> {
  let component = componentIds++ as Component<Tag>
  assert(component <= LO_MASK)
  return component
}

export function makeValueComponent<T>(
  schema: SchemaOf<T>,
): Component<SchemaOf<T>>
export function makeValueComponent<T>(): Component<T>
export function makeValueComponent<T extends Schema>(
  schema: T,
): Component<T>
export function makeValueComponent(schema?: Schema) {
  let component = makeTagComponent() as Component
  setSchema(component, schema ?? Dynamic)
  componentSchemas[component] = schema ?? Dynamic
  return component
}
