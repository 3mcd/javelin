import {
  App,
  DefaultGroup,
  Plugin,
  Constrain,
  make_app,
} from "./app.js"
import {ChildOf, make_relation, Without} from "./relation.js"
import {resource} from "./resource.js"
import {make_component, make_tag, Component} from "./term.js"
import {make_selector, Selector, Type} from "./type.js"
import {World, Values} from "./world.js"
import {slot} from "./slot.js"

export type {Entity} from "./entity.js"
export {Monitor} from "./monitor.js"
export {Node} from "./graph.js"
export type {SystemImpl as System} from "./system.js"

export {
  make_app as app,
  slot,
  ChildOf,
  make_component as component,
  DefaultGroup as Group,
  make_relation as relation,
  resource,
  make_tag as tag,
  make_selector as type,
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

export {normalize_spec} from "./type.js"
