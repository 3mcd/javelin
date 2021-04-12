import { Component, mutableEmpty } from "@javelin/ecs"
import { createModel, ModelConfig, ModelNode, ModelNodeKind } from "./model"

type ObservedProps<T = any> = T & {
  __index__: number
  __parent__: any
  __record__: ModelNode
}

const recordIsCollection = (record: ModelNode) =>
  record.kind === ModelNodeKind.Array || record.kind === ModelNodeKind.Map
const recordIsCollectionDescendant = (record: ModelNode) =>
  record.inCollection === true

const tmpCollectionTraverse: string[] = []

export function createObserver(
  config: ModelConfig,
  onChange: (object: object) => {},
) {
  const model = createModel(config)
  const proxies = new WeakMap()
  const set = (target: ObservedProps, key: string | symbol, value: any) => {
    target[key] = value
    onChange(target)
    return true
  }

  const handlerForNestedCollection = {
    get(target: ObservedProps, key: string | symbol) {
      const value = target[key]
      value.__index__ = key
      value.__parent__ = target
      return observe(value, target, key)
    },
    set(target: ObservedProps, key: string | symbol, value: any) {
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
      onChange(target)
      return true
    },
  }

  const handlerForCollectionDescendant = {
    get(target: ObservedProps, key: string | symbol) {
      const value = target[key]
      value.__parent__ = target
      return observe(value, target, key)
    },
    set(target: ObservedProps, key: string | symbol, value: any) {
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
      onChange(target)
      return true
    },
  }

  const handlerForCollection = {
    get(target: ObservedProps, key: string | symbol) {
      const value = target[key]
      value.__index__ = key
      return observe(value, target, key)
    },
    set,
  }

  const handlerForStruct = {
    get(target: ObservedProps, key: string | symbol) {
      return observe(target[key], target, key)
    },
    set,
  }

  const handlerForPrimitive = {
    get(target: ObservedProps, key: string | symbol) {
      return target[key]
    },
    set,
  }

  const getHandler = (record: ModelNode) => {
    if ("type" in record) {
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

  const observe = (
    object: any,
    parent?: ObservedProps,
    key?: string | symbol,
  ) => {
    let proxy = proxies.get(object)
    if (proxy === undefined) {
      const record =
        parent === undefined
          ? model[(object as Component)._tid]
          : "keys" in parent.__record__!
          ? parent.__record__.keys[key as string]
          : parent.__record__!
      object.__record__ = record
      proxy = new Proxy(object, getHandler(record))
      proxies.set(object, proxy)
    }

    return proxy
  }
  return {
    observe,
  }
}
