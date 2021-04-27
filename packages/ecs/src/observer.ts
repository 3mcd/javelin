import { ModelNode, ModelNodeKind, ModelNodeStruct } from "@javelin/model"
import { Component } from "./component"
import { globals } from "./internal"

export type ObserverChangePointer = {
  field: number
  path: string
  split: string[]
  traverse: string[]
}
export type ObserverChangeInfo = {
  value: unknown
  pointer: ObserverChangePointer
}
export type ObserverChangeSet = Record<string, ObserverChangeInfo>
export type Observer = {
  set(component: Component, path: string, value: unknown): void
  track(component: Component, path: string, value: unknown): void
  changesOf(component: Component): ObserverChangeSet | null
}

const PATH_DELIMITER = "."
const pointerLookup: Record<number, Record<string, ObserverChangePointer>> = {}

export const createObserver = (): Observer => {
  const cache = new WeakMap<Component, ObserverChangeSet>()
  const track = (component: Component, path: string, value: unknown) => {
    const { __type__: type } = component
    const root = globals.__MODEL__[type]
    let pointers = pointerLookup[type]
    if (pointers === undefined) {
      pointers = pointerLookup[type] = {}
    }
    let pointer = pointers[path]
    if (pointer === undefined) {
      let node: ModelNode = root
      const traverse: string[] = []
      const split = path.split(PATH_DELIMITER)
      for (let i = 0; i < split.length; i++) {
        const sub = split[i]
        switch (node.kind) {
          case ModelNodeKind.Array:
          case ModelNodeKind.Map:
            node = node.edge
            traverse.push(sub)
            break
          case ModelNodeKind.Struct:
            node = node.keys[sub]
            break
        }
      }
      pointers[path] = pointer = { traverse, path, split, field: node.id }
    }

    let changes = cache.get(component)
    if (changes === undefined) {
      changes = {}
      cache.set(component, changes)
    }
    if (changes[path]) {
      changes[path].value = value
    } else {
      changes[path] = { pointer, value }
    }
    return pointer
  }
  const set = (component: Component, path: string, value: unknown) => {
    const { split } = track(component, path, value)
    const end = split.length - 1
    let parent = component
    let i: number
    for (i = 0; i < end; i++) {
      parent = component[split[i]]
    }
    parent[split[i]] = value
  }
  const changesOf = (component: Component) => cache.get(component) || null

  return { track, changesOf, set }
}
