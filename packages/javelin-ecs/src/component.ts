import {assert, expect, Opaque} from "@javelin/lib"
import {LO_MASK} from "./entity.js"
import {Express, Schema, SchemaOf} from "./schema.js"

export const Dynamic = Symbol()
export type Dynamic = typeof Dynamic

export declare const Tag: unique symbol
export type Tag = typeof Tag

export type ComponentSpec = Dynamic | Schema | Tag | unknown
export type ComponentValue<T extends ComponentSpec> =
  unknown extends T
    ? unknown
    : T extends Schema
    ? Express<T>
    : T extends Tag
    ? never
    : T
export type ComponentInitValue<T extends ComponentSpec> =
  unknown extends T
    ? unknown
    : T extends Schema
    ? Express<T> | void
    : T extends Tag
    ? never
    : T
export type ComponentInitValues<
  T extends Component[],
  U extends unknown[] = [],
> = T extends []
  ? U
  : T extends [infer Head, ...infer Tail]
  ? Tail extends Component[]
    ? Head extends Component<infer Value>
      ? ComponentInitValues<
          Tail,
          Value extends Tag ? U : [...U, ComponentInitValue<Value>]
        >
      : never
    : never
  : never

export type Component<T extends ComponentSpec = unknown> = Opaque<
  number,
  T
>

let component_ids = 0
let component_schemas: (Schema | Dynamic)[] = []

/**
 * @private
 */
export let has_schema = (component: Component) =>
  component in component_schemas

/**
 * @private
 */
export let get_schema = (component: Component) =>
  component_schemas[component]

/**
 * @private
 */
export let set_schema = (
  component: Component,
  schema: Schema | Dynamic,
) => (component_schemas[component] = schema)

/**
 * @private
 */
export let express = <T>(
  component: Component<T>,
): ComponentValue<T> => {
  let component_schema = expect(get_schema(component))
  assert(component_schema !== Dynamic)
  if (typeof component_schema === "string") {
    return 0 as unknown as ComponentValue<T>
  }
  let component_value = {} as Record<string, number>
  for (let prop in component_schema) {
    component_value[prop] = 0
  }
  return component_value as unknown as ComponentValue<T>
}

export function make_tag_component(): Component<Tag> {
  let component = component_ids++ as Component<Tag>
  assert(component <= LO_MASK)
  return component
}

export function make_value_component<T>(
  component_schema: SchemaOf<T>,
): Component<SchemaOf<T>>
export function make_value_component<T>(): Component<T>
export function make_value_component<T extends Schema>(
  component_schema: T,
): Component<T>
export function make_value_component(component_schema?: Schema) {
  let component = make_tag_component() as Component
  set_schema(component, component_schema ?? Dynamic)
  component_schemas[component] = component_schema ?? Dynamic
  return component
}
