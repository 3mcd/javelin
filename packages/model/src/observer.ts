import { mutableEmpty } from "@javelin/ecs"
import {
  ModelNode,
  ModelNodeBase,
  ModelNodeCollection,
  ModelNodeKind,
} from "./model"

type Change = [number, any] | [number, any, string[]]
type ChangeSet = { [key: string]: Change }

const changeSetPush = (
  changes: ChangeSet,
  field: number,
  value: any,
  traverse?: string[],
) => {
  if (traverse === undefined) {
    changes[field] = value
  } else {
    changes[`${field},${traverse.join(",")}`] = value
  }
}

type ObservedProps = {
  $changes: ChangeSet
  $index: number
  $parent: any
  $root: ObservedProps
  $type: ModelNode
}

type ObservedInstance<T = any> = T & ObservedProps

const recordIsCollection = (
  record: ModelNodeBase,
): record is ModelNodeCollection =>
  record.kind === ModelNodeKind.Array || record.kind === ModelNodeKind.Map
const recordIsCollectionDescendant = (record: ModelNode) =>
  record.inCollection === true

const tmpCollectionTraverse: string[] = []

export function createObserver() {
  const proxies = new WeakMap()
  const set = (target: ObservedInstance, key: string | symbol, value: any) => {
    target[key] = value
    changeSetPush(target.$changes, target.$type.idsByKey[key], value)
    return true
  }

  const handlerForNestedCollection = {
    get(target: ObservedInstance, key: string | symbol) {
      const value = target[key]
      value.$index = key
      value.$parent = target
      return observeInner(value, target, key)
    },
    set(target: ObservedInstance, key: string | symbol, value: any) {
      mutableEmpty(tmpCollectionTraverse)
      tmpCollectionTraverse.push(key as string)
      let parent = target
      while (parent !== undefined) {
        const { $parent, $index } = parent
        if ($index !== undefined) {
          tmpCollectionTraverse.unshift($index)
        }
        parent = $parent
      }

      target[key] = value
      target.$changes[target.$type.idsByKey[key]] = value
      return true
    },
  }

  const handlerForCollectionDescendant = {
    get(target: ObservedInstance, key: string | symbol) {
      const value = target[key]
      value.$parent = target
      return observeInner(value, target, key)
    },
    set(target: ObservedInstance, key: string | symbol, value: any) {
      mutableEmpty(tmpCollectionTraverse)
      let parent = target
      while (parent !== undefined) {
        const { $parent, $index } = parent
        if ($index !== undefined) {
          tmpCollectionTraverse.unshift($index)
        }
        parent = $parent
      }

      target[key] = value
      target.$changes[target.$type.idsByKey[key]] = value
      return true
    },
  }

  const handlerForCollection = {
    get(target: ObservedInstance, key: string | symbol) {
      const value = target[key]
      value.$index = key
      return observeInner(value, target, key)
    },
    set,
  }

  const handlerForStruct = {
    get(target: ObservedInstance, key: string | symbol) {
      return observeInner(target[key], target, key)
    },
    set,
  }

  const handlerForPrimitive = {
    get(target: ObservedInstance, key: string | symbol) {
      return target[key]
    },
    set,
  }

  const getHandler = (record: ModelNode) => {
    if (record.kind === ModelNodeKind.Primitive) {
      return handlerForPrimitive
    } else if (
      recordIsCollection(record) &&
      recordIsCollectionDescendant(record)
    ) {
      return handlerForNestedCollection
    } else if (recordIsCollection(record)) {
      return handlerForCollection
    } else if (recordIsCollectionDescendant(record)) {
      return handlerForCollectionDescendant
    } else {
      return handlerForStruct
    }
  }

  const observeInner = (
    object: ObservedInstance,
    parent: ObservedProps,
    key?: string | symbol,
  ) => {
    let proxy = proxies.get(object)
    if (proxy === undefined) {
      const record =
        "keys" in parent.$type!
          ? parent.$type.keys[key as string]
          : // parent will never be primitive
            (parent.$type as ModelNodeCollection).edge
      object.$type = record
      object.$changes = parent.$changes || {}
      proxy = new Proxy(object, getHandler(record))
      proxies.set(object, proxy)
    }

    return proxy
  }

  const observe = <T extends object>(object: T, record: ModelNode): T => {
    let proxy = proxies.get(object)
    if (proxy === undefined) {
      proxy = new Proxy(object, getHandler(record))
      ;(object as ObservedProps).$type = record
      ;(object as ObservedProps).$changes = {}
      proxies.set(object, proxy)
    }
    return proxy
  }

  return {
    observe,
  }
}
