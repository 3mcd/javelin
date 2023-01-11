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

let component_ids = 0
let component_schemas: (Schema | Dynamic)[] = []

export let has_schema = (component: Component) =>
  component in component_schemas
export let get_schema = (component: Component) =>
  component_schemas[component]
export let set_schema = (
  component: Component,
  schema: Schema | Dynamic,
) => (component_schemas[component] = schema)

export let express_component = <T>(
  component: Component<T>,
): ComponentValue<T> => {
  let schema = expect(get_schema(component))
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

export function make_tag(): Component<Tag> {
  let component = component_ids++ as Component<Tag>
  assert(component <= LO_MASK)
  return component
}

export function make_component<T>(
  schema: SchemaOf<T>,
): Component<SchemaOf<T>>
export function make_component<T>(): Component<T>
export function make_component<T extends Schema>(
  schema: T,
): Component<T>
export function make_component(schema?: Schema) {
  let component = make_tag() as Component
  set_schema(component, schema ?? Dynamic)
  component_schemas[component] = schema ?? Dynamic
  return component
}
