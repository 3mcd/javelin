import {assert, expect, Opaque} from "@javelin/lib"
import {LO_MASK} from "./entity.js"
import {Express, Schema, SchemaOf} from "./schema.js"

/**
 * @private
 */
export const _keys = Symbol()

/**
 * @private
 */
export const _dynamic = Symbol()

/**
 * @private
 */
export type Dynamic = typeof _dynamic

export declare const Tag: unique symbol
export type Tag = typeof Tag

export type ComponentSpec = Dynamic | Schema | Tag | unknown
export type Value<T extends ComponentSpec> = unknown extends T
  ? unknown
  : T extends Schema
  ? Express<T>
  : T extends Tag
  ? never
  : T
export type ValueInit<T extends ComponentSpec> = unknown extends T
  ? unknown
  : T extends Schema
  ? Express<T> | void
  : T extends Tag
  ? never
  : T
export type ValuesInit<
  T extends Component[],
  U extends unknown[] = [],
> = T extends []
  ? U
  : T extends [infer Head, ...infer Tail]
  ? Tail extends Component[]
    ? Head extends Component<infer Value>
      ? ValuesInit<Tail, Value extends Tag ? U : [...U, ValueInit<Value>]>
      : never
    : never
  : never

export type Component<T extends ComponentSpec = unknown> = Opaque<number, T>

let componentIds = 0
let componentSchemas: (Schema | Dynamic)[] = []

/**
 * @private
 */
export let hasSchema = (component: Component) => component in componentSchemas

/**
 * @private
 */
export let getSchema = (component: Component) => componentSchemas[component]

/**
 * @private
 */
export let setSchema = (component: Component, schema: Schema | Dynamic) =>
  (componentSchemas[component] = schema)

/**
 * @private
 */
export let express = <T>(component: Component<T>): Value<T> => {
  let schema = expect(getSchema(component))
  assert(schema !== _dynamic)
  if (typeof schema === "string") {
    return 0 as unknown as Value<T>
  }
  let value = {} as Record<string, number>
  for (let prop in schema) {
    value[prop] = 0
  }
  return value as Value<T>
}

export let makeTagComponent = (): Component<Tag> => {
  let component = componentIds++ as Component<Tag>
  assert(component <= LO_MASK)
  return component
}

export function makeValueComponent<T>(
  schema: SchemaOf<T>,
): Component<SchemaOf<T>>
export function makeValueComponent<T>(): Component<T>
export function makeValueComponent<T extends Schema>(schema: T): Component<T>
export function makeValueComponent(schema?: Schema) {
  let component = makeTagComponent() as Component
  if (typeof schema === "object") {
    Object.defineProperty(schema, _keys, {
      value: Object.keys(schema).sort(),
      enumerable: false,
    })
  }
  setSchema(component, schema ?? _dynamic)
  componentSchemas[component] = schema ?? _dynamic
  return component
}
