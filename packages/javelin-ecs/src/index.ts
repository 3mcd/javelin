export type {App, Constrain, Plugin} from "./app.js"
export type {Entity} from "./entity.js"
export type {SystemImpl as System} from "./system.js"
export type {Component} from "./component.js"
export type {Format, Schema} from "./schema.js"

export {ChildOf, Without} from "./relation.js"
export {Phase} from "./world"
export {Monitor} from "./monitor.js"
export {Node} from "./graph.js"
export {Type, QuerySelector, normalizeQueryTerms} from "./type.js"
export {World} from "./world.js"

export {DefaultGroup as Group, makeApp as app} from "./app.js"
export {makeRelation as relation} from "./relation.js"
export {makeResource as resource} from "./resource.js"
export {makeQuerySelector as type} from "./type.js"
export {makeSlot as slot} from "./slot.js"
export {Dynamic, getSchema} from "./component.js"

import {SchemaOf, Schema} from "./schema.js"
import {Component, Tag} from "./component.js"
import {QuerySelector} from "./type.js"
import {makeValueComponent, makeTagComponent} from "./component.js"

export let tag = (): QuerySelector<[Component<typeof Tag>]> => {
  let tagComponent = makeTagComponent()
  return new QuerySelector([tagComponent])
}

export function value<T>(
  componentSchema: SchemaOf<T>,
): QuerySelector<[Component<SchemaOf<T>>]>
export function value<T>(): QuerySelector<[Component<T>]>
export function value<T extends Schema>(
  componentSchema: T,
): QuerySelector<[Component<T>]>
export function value() {
  let valueComponent = makeValueComponent.apply(
    null,
    arguments as unknown as [Schema],
  )
  return new QuerySelector([valueComponent])
}
