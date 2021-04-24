import { ModelNode, ModelNodeStruct } from "@javelin/model"
import { Component } from "./component"
import { globals } from "./internal"

const PATH_DELIMITER = "."
const fieldCache: Record<number, Record<string, number>> = {}

export type ObserverChangeSet = Record<number, unknown>
export type Observer = {
  track(component: Component, path: string, value: unknown): void
  changesOf(component: Component): ObserverChangeSet | null
}

export const createObserver = (): Observer => {
  const cache = new WeakMap<Component, ObserverChangeSet>()
  const track = (component: Component, path: string, value: unknown) => {
    const { __type__: type } = component
    const root = globals.__MODEL__[type]
    let fields = fieldCache[type]
    if (fields === undefined) {
      fields = fieldCache[type] = {}
    }
    let field = fields[path]
    if (field === undefined) {
      let node: ModelNode = root
      let acc = ""
      const end = path.length - 1
      for (let i = 0; i < path.length; i++) {
        const char = path[i]
        if (char === PATH_DELIMITER) {
          node = (node as ModelNodeStruct).keys[acc]
          acc = ""
        } else {
          acc += char
        }

        if (i === end && acc.length > 0) {
          node = (node as ModelNodeStruct).keys[acc]
        }
      }
      field = fields[path] = node.id
    }
    let changes = cache.get(component)
    if (changes === undefined) {
      changes = {}
      cache.set(component, changes)
    }
    changes[field] = value
  }
  const changesOf = (component: Component) => cache.get(component) || null

  return { track, changesOf }
}
