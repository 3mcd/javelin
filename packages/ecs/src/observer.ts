import { ModelNode, ModelNodeKind, ModelNodeStruct } from "@javelin/model"
import { Component } from "./component"
import { globals } from "./internal"

export const NO_OP = Symbol("javelin_observer_no_op")

export enum MutArrayMethod {
  Pop,
  Push,
  Shift,
  Unshift,
  Splice,
}
export type ObserverChangeRecord = {
  field: number
  path: string
  split: string[]
  traverse: string[]
}
export type ObserverChange = {
  value: unknown | typeof NO_OP
  record: ObserverChangeRecord
}
export type ObserverChangeArray = { record: ObserverChangeRecord } & (
  | { method: MutArrayMethod.Pop }
  | { method: MutArrayMethod.Push; values: unknown[] }
  | { method: MutArrayMethod.Shift }
  | { method: MutArrayMethod.Unshift; values: unknown[] }
  | {
      method: MutArrayMethod.Splice
      index: number
      remove: number
      values: unknown[]
    }
)
export type ObserverChangeSet = {
  object: Record<string, ObserverChange>
  objectCount: number
  array: ObserverChangeArray[]
  arrayCount: number
}
export type Observer = {
  track(component: Component, path: string, value: unknown): void
  trackPop(component: Component, path: string): void
  trackPush(component: Component, path: string, ...values: unknown[]): void
  trackShift(component: Component, path: string): void
  trackUnshift(component: Component, path: string, ...values: unknown[]): void
  trackSplice(
    component: Component,
    path: string,
    index: number,
    remove: number,
    ...values: unknown[]
  ): void
  reset(component: Component): void
  clear(): void
  changesOf(component: Component): ObserverChangeSet | null
}

const PATH_DELIMITER = "."
const recordLookup: Record<number, Record<string, ObserverChangeRecord>> = {}

export const createObserver = (): Observer => {
  let cache = new Map<Component, ObserverChangeSet>()
  const getRecord = (component: Component, path: string) => {
    const { __type__: type } = component
    const root = globals.__MODEL__[type]
    let records = recordLookup[type]
    if (records === undefined) {
      records = recordLookup[type] = {}
    }
    let record = records[path]
    if (record === undefined) {
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
      records[path] = record = { traverse, path, split, field: node.id }
    }
    return record
  }
  const getChanges = (component: Component) => {
    let changes = cache.get(component)
    if (changes === undefined) {
      changes = { object: {}, objectCount: 0, array: [], arrayCount: 0 }
      cache.set(component, changes)
    }
    return changes
  }
  const track = (component: Component, path: string, value: unknown) => {
    const record = getRecord(component, path)
    const changes = getChanges(component)
    const change = changes.object[path]
    if (change) {
      if (change.value === NO_OP) {
        changes.objectCount++
      }
      change.value = value
    } else {
      changes.objectCount++
      changes.object[path] = { record, value }
    }
  }
  const trackPop = (component: Component, path: string) => {
    const record = getRecord(component, path)
    const changes = getChanges(component)
    changes.arrayCount++
    changes.array.push({ method: MutArrayMethod.Pop, record })
  }
  const trackPush = (
    component: Component,
    path: string,
    ...values: unknown[]
  ) => {
    const record = getRecord(component, path)
    const changes = getChanges(component)
    changes.arrayCount++
    changes.array.push({ method: MutArrayMethod.Push, record, values })
  }
  const trackShift = (component: Component, path: string) => {
    const record = getRecord(component, path)
    const changes = getChanges(component)
    changes.arrayCount++
    changes.array.push({ method: MutArrayMethod.Shift, record })
  }
  const trackUnshift = (
    component: Component,
    path: string,
    ...values: unknown[]
  ) => {
    const record = getRecord(component, path)
    const changes = getChanges(component)
    changes.arrayCount++
    changes.array.push({
      method: MutArrayMethod.Unshift,
      record,
      values,
    })
  }
  const trackSplice = (
    component: Component,
    path: string,
    index: number,
    remove: number,
    ...values: unknown[]
  ) => {
    const record = getRecord(component, path)
    const changes = getChanges(component)
    changes.arrayCount++
    changes.array.push({
      method: MutArrayMethod.Splice,
      record,
      index,
      remove,
      values,
    })
  }
  const resetChanges = (changes: ObserverChangeSet) => {
    for (const prop in changes.array) {
      delete changes.array[prop]
    }
    for (const prop in changes.object) {
      changes.object[prop].value = NO_OP
    }
    changes.objectCount = 0
    changes.arrayCount = 0
  }
  const reset = (component: Component) => {
    const changes = cache.get(component)
    if (changes !== undefined) {
      resetChanges(changes)
    }
  }
  const clear = () => {
    cache.forEach(resetChanges)
  }
  const changesOf = (component: Component) => cache.get(component) || null

  return {
    track,
    trackPop,
    trackPush,
    trackShift,
    trackUnshift,
    trackSplice,
    changesOf,
    reset,
    clear,
  }
}
