export type {App, Constrain, Plugin} from "./app.js"
export type {Entity} from "./entity.js"
export type {SystemImpl as System} from "./system.js"
export type {World} from "./world.js"
export type {Component} from "./component.js"
export type {Format, Schema} from "./schema.js"

export {ChildOf, Without} from "./relation.js"
export {Phase} from "./world"
export {Monitor} from "./monitor.js"
export {Node} from "./graph.js"
export {Type, Selector, normalize_spec} from "./type.js"

export {DefaultGroup as Group, make_app as app} from "./app.js"
export {makeRelation as relation} from "./relation.js"
export {makeResource as resource} from "./resource.js"
export {makeSelector as type} from "./type.js"
export {makeSlot as slot} from "./slot.js"
export {Dynamic, get_schema} from "./component.js"

import {SchemaOf, Schema} from "./schema.js"
import {Component, Tag} from "./component.js"
import {Selector} from "./type.js"
import {
  make_value_component,
  make_tag_component,
} from "./component.js"

export function tag(): Selector<[Component<typeof Tag>]> {
  let tagComponent = make_tag_component()
  return new Selector([tagComponent])
}

export function value<T>(
  componentSchema: SchemaOf<T>,
): Selector<[Component<SchemaOf<T>>]>
export function value<T>(): Selector<[Component<T>]>
export function value<T extends Schema>(
  componentSchema: T,
): Selector<[Component<T>]>
export function value() {
  let valueComponent = make_value_component.apply(
    null,
    arguments as unknown as [Schema],
  )
  return new Selector([valueComponent])
}
