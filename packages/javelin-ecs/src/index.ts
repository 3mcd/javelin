import {App, DefaultGroup, Plugin, Constrain, makeApp} from "./app.js"
import {ChildOf, makeRelation, Without} from "./relation.js"
import {resource} from "./resource.js"
import {
  makeValueComponent,
  makeTagComponent,
  Component,
} from "./term.js"
import {makeSelector, Selector, Type} from "./type.js"
import {World, Values} from "./world.js"
import {slot} from "./slot.js"

export {Phase} from "./world"
export type {Entity} from "./entity.js"
export {Monitor} from "./monitor.js"
export {Node} from "./graph.js"
export type {SystemImpl as System} from "./system.js"

export {
  makeApp as app,
  slot,
  ChildOf,
  makeValueComponent as value,
  DefaultGroup as Group,
  makeRelation as relation,
  resource,
  makeTagComponent as tag,
  makeSelector as type,
  Without,
  World,
  Type,
  Selector,
}

export type {
  App,
  Values as TermValues,
  Component as Term,
  Plugin,
  Constrain,
}

export {normalizeSpec} from "./type.js"
