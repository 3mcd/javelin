import { mutableEmpty } from "@javelin/ecs"
import {
  ModelNode,
  ModelNodeBase,
  ModelNodeCollection,
  ModelNodeKind,
  ModelNodeStruct,
} from "./model"

type ChangeSetOp = { field: number; traverse?: string[] }
type ChangeSetField = ChangeSetOp & { value: any }
type ChangeSetArrayOp = ChangeSetOp & {
  index: number
  insert: any
  remove: number
}
type ChangeSet = {
  fields: { [key: string]: ChangeSetField }
  arrays: ChangeSetArrayOp[]
}

const MUT_ARRAY_METHODS: Set<Function> = new Set<Function>([
  Array.prototype.push,
  Array.prototype.pop,
  Array.prototype.shift,
  Array.prototype.unshift,
  Array.prototype.splice,
])

const changeSetFieldOp = (
  changes: ChangeSet,
  field: number,
  value: any,
  traverse?: string[],
) => {
  if (traverse === undefined) {
    changes.fields[field] = value
  } else {
    changes.fields[`${field},${traverse.join(",")}`] = value
  }
}

const changeSetArrayOp = (
  changes: ChangeSet,
  field: number,
  index: number,
  insert: any[],
  remove: number,
  traverse: string[],
) => {
  changes.arrays.push({
    field,
    index,
    insert,
    remove,
    traverse,
  })
}

type ObservedProps<
  T extends ModelNodeBase = ModelNodeBase,
  P = { [key: string]: any }
> = {
  $lock: boolean
  $self: any
  $changes: ChangeSet
  $index: string
  $parent: any
  $type: T
} & P

const recordIsCollection = (
  record: ModelNodeBase,
): record is ModelNodeCollection =>
  record.kind === ModelNodeKind.Array || record.kind === ModelNodeKind.Map
const recordIsCollectionDescendant = (record: ModelNode) =>
  record.inCollection === true

const tmpTraverse: string[] = []

export function createObserver() {
  const proxies = new WeakMap<object, ObservedProps>()
  const set = (target: ObservedProps, key: string, value: any) => {
    target[key] = value
    changeSetFieldOp(
      target.$changes,
      (target.$type as ModelNodeStruct).idsByKey[key],
      value,
    )
    return true
  }

  const handlerForNestedCollection = {
    get(target: ObservedProps, key: string): any {
      if (key === "$self") return target
      const value = target[key]
      value.$index = key
      value.$parent = target
      return observeInner(value, target, key)
    },
    set(target: ObservedProps<ModelNodeStruct>, key: string, value: any) {
      if (target.$lock) {
        return true
      }

      mutableEmpty(tmpTraverse)
      tmpTraverse.push(key)
      let parent = target
      while (parent !== undefined) {
        const { $parent, $index } = parent
        if ($index !== undefined) {
          tmpTraverse.unshift($index)
        }
        parent = $parent
      }

      target[key] = value
      target.$changes.fields[target.$type.idsByKey[key]] = value

      return true
    },
  }

  const handlerForCollectionDescendant = {
    get(target: ObservedProps, key: string): any {
      if (key === "$self") return target
      const value = target[key]
      value.$parent = target
      return observeInner(value, target, key)
    },
    set(target: ObservedProps<ModelNodeStruct>, key: string, value: any) {
      mutableEmpty(tmpTraverse)
      let parent = target
      while (parent !== undefined) {
        const { $parent, $index } = parent
        if ($index !== undefined) {
          tmpTraverse.unshift($index)
        }
        parent = $parent
      }

      target[key] = value
      target.$changes.fields[target.$type.idsByKey[key]] = value
      return true
    },
  }

  const handlerForCollection = {
    get(target: ObservedProps, key: string): any {
      if (key === "$self") return target
      const value = target[key]
      value.$index = key
      return observeInner(value, target, key)
    },
    set(target: ObservedProps, key: string, value: any) {
      if (target.$lock) {
        return true
      }
      return set(target, key, value)
    },
  }

  const handlerForStruct = {
    get(target: ObservedProps, key: string): any {
      if (key === "$self") return target
      return observeInner(target[key], target, key)
    },
    set,
  }

  const handlerForPrimitive = {
    get(target: ObservedProps, key: string) {
      if (key === "$self") return target
      return target[key]
    },
    set,
  }

  const handlerForArrayMethod = {
    apply(
      target: ObservedProps<ModelNodeBase, Function>,
      thisArg: ObservedProps,
      args: any[],
    ) {
      let mut = MUT_ARRAY_METHODS.has(target)
      if (mut) {
        thisArg = thisArg.$self
        thisArg.$lock = true
        let parent = thisArg
        while (parent !== undefined) {
          const { $parent, $index } = parent
          if ($index !== undefined) {
            tmpTraverse.unshift($index.toString())
          }
          parent = $parent
        }
        switch (target as Function) {
          case Array.prototype.push:
            changeSetArrayOp(
              thisArg.$changes,
              thisArg.$type.id,
              ((thisArg as unknown) as any[]).length - 1,
              args,
              0,
              tmpTraverse,
            )
            break
          case Array.prototype.pop:
            changeSetArrayOp(
              thisArg.$changes,
              thisArg.$type.id,
              ((thisArg as unknown) as any[]).length - 1,
              [],
              1,
              tmpTraverse,
            )
            break
          case Array.prototype.shift:
            changeSetArrayOp(
              thisArg.$changes,
              thisArg.$type.id,
              0,
              [],
              1,
              tmpTraverse,
            )
            break
          case Array.prototype.unshift:
            changeSetArrayOp(
              thisArg.$changes,
              thisArg.$type.id,
              0,
              args,
              0,
              tmpTraverse,
            )
            break
          case Array.prototype.splice: {
            const [from, to, ...insert] = args
            changeSetArrayOp(
              thisArg.$changes,
              thisArg.$type.id,
              from,
              insert,
              to,
              tmpTraverse,
            )
            break
          }
        }
      }
      Reflect.apply(target, thisArg, args)
      if (mut) {
        thisArg.$lock = false
      }
    },
  }

  const getHandler = (record: ModelNode, object: any) => {
    if (MUT_ARRAY_METHODS.has(object)) {
      return handlerForArrayMethod
    }
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
    object: ObservedProps,
    parent: ObservedProps,
    key?: string,
  ) => {
    let proxy = proxies.get(object)
    if (proxy === undefined) {
      const record =
        "keys" in parent.$type!
          ? // struct
            (parent.$type as ModelNodeStruct).keys[key as string]
          : // only other option is collection because a parent will never be
            // a primitive type
            (parent.$type as ModelNodeCollection).edge
      object.$type = record
      object.$lock = false
      object.$changes = parent.$changes

      proxy = new Proxy(object, getHandler(record, object))
      proxies.set(object, proxy)
    }

    return proxy
  }

  const observe = <T extends object>(object: T, record: ModelNode): T => {
    let proxy = proxies.get(object)
    if (proxy === undefined) {
      proxy = new Proxy(object as any, getHandler(record, object))
      ;(object as ObservedProps).$lock = false
      ;(object as ObservedProps).$type = record
      ;(object as ObservedProps).$changes = {
        fields: {},
        arrays: [],
      }
      proxies.set(object, proxy!)
    }
    return proxy as T
  }

  return {
    observe,
  }
}
