import { mutableEmpty } from "@javelin/ecs"
import {
  ModelNode,
  ModelNodeBase,
  ModelNodeCollection,
  ModelNodeKind,
  ModelNodeStruct,
} from "./model"

type ObservedProps = {
  __index__: number
  __parent__: any
  __type__: ModelNode
}

type ObservedInstance<T = any> = T & ObservedProps

const recordIsCollection = (
  record: ModelNodeBase,
): record is ModelNodeCollection =>
  record.kind === ModelNodeKind.Array || record.kind === ModelNodeKind.Map
const recordIsCollectionDescendant = (record: ModelNode) =>
  record.inCollection === true

const tmpCollectionTraverse: string[] = []
const getKeyId = (target: ObservedProps, key: string | symbol) => {
  const { __type__: type } = target
  let node: ModelNode
  if (recordIsCollection(type)) {
    node = type.edge
  } else {
    node = (type as ModelNodeStruct).keys[key as string]
  }
  return node.id
}

export function createObserver(
  onChange: (object: object, id: number, value: unknown) => void,
) {
  const proxies = new WeakMap()
  const set = (target: ObservedInstance, key: string | symbol, value: any) => {
    target[key] = value
    onChange(target, getKeyId(target, key), value)
    return true
  }

  const handlerForNestedCollection = {
    get(target: ObservedInstance, key: string | symbol) {
      const value = target[key]
      value.__index__ = key
      value.__parent__ = target
      return observeInner(value, target, key)
    },
    set(target: ObservedInstance, key: string | symbol, value: any) {
      mutableEmpty(tmpCollectionTraverse)
      tmpCollectionTraverse.push(key as string)
      let parent = target
      while (parent !== undefined) {
        const { __parent__, __index__ } = parent
        if (__index__ !== undefined) {
          tmpCollectionTraverse.unshift(__index__)
        }
        parent = __parent__
      }

      target[key] = value
      onChange(target, getKeyId(target, key), value)
      return true
    },
  }

  const handlerForCollectionDescendant = {
    get(target: ObservedInstance, key: string | symbol) {
      const value = target[key]
      value.__parent__ = target
      return observeInner(value, target, key)
    },
    set(target: ObservedInstance, key: string | symbol, value: any) {
      mutableEmpty(tmpCollectionTraverse)
      let parent = target
      while (parent !== undefined) {
        const { __parent__, __index__ } = parent
        if (__index__ !== undefined) {
          tmpCollectionTraverse.unshift(__index__)
        }
        parent = __parent__
      }

      target[key] = value
      onChange(target, getKeyId(target, key), value)
      return true
    },
  }

  const handlerForCollection = {
    get(target: ObservedInstance, key: string | symbol) {
      const value = target[key]
      value.__index__ = key
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
        "keys" in parent.__type__!
          ? parent.__type__.keys[key as string]
          : // parent will never be primitive
            (parent.__type__ as ModelNodeCollection).edge
      object.__type__ = record
      proxy = new Proxy(object, getHandler(record))
      proxies.set(object, proxy)
    }

    return proxy
  }

  const observe = <T extends object>(object: T, record: ModelNode): T => {
    let proxy = proxies.get(object)
    if (proxy === undefined) {
      proxy = new Proxy(object, getHandler(record))
      ;(object as ObservedInstance).__type__ = record
      proxies.set(object, proxy)
    }
    return proxy
  }

  return {
    observe,
  }
}
