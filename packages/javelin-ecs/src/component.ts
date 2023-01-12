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
  let componentSchema = expect(getSchema(component))
  assert(componentSchema !== Dynamic)
  if (typeof componentSchema === "string") {
    return 0 as unknown as ComponentValue<T>
  }
  let componentValue = {} as Record<string, number>
  for (let prop in componentSchema) {
    componentValue[prop] = 0
  }
  return componentValue as unknown as ComponentValue<T>
}

export function makeTagComponent(): Component<Tag> {
  let component = componentIds++ as Component<Tag>
  assert(component <= LO_MASK)
  return component
}

export function makeValueComponent<T>(
  componentSchema: SchemaOf<T>,
): Component<SchemaOf<T>>
export function makeValueComponent<T>(): Component<T>
export function makeValueComponent<T extends Schema>(
  componentSchema: T,
): Component<T>
export function makeValueComponent(componentSchema?: Schema) {
  let component = makeTagComponent() as Component
  setSchema(component, componentSchema ?? Dynamic)
  componentSchemas[component] = componentSchema ?? Dynamic
  return component
}
