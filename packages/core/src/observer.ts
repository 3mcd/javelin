import {
  ModelNode,
  ModelNodeBase,
  ModelNodeCollection,
  ModelNodeKind,
  ModelNodeStruct,
} from "./model"
import { mutableEmpty } from "./utils"

export const NO_OP = Symbol("NO_OP")

export type ChangeSetOp = { field: number; traverse?: string[] }
export type ChangeSetField = ChangeSetOp & { value: any }
export type ChangeSetArrayOp = ChangeSetOp & {
  index: number
  insert: any[] | null
  remove: number
}
export type ChangeSet = {
  fieldsCount: number
  fields: { [key: string]: typeof NO_OP | ChangeSetField }
  arrays: ChangeSetArrayOp[]
}

const MUT_ARRAY_METHODS: Set<Function> = new Set<Function>([
  Array.prototype.push,
  Array.prototype.pop,
  Array.prototype.shift,
  Array.prototype.unshift,
  Array.prototype.splice,
  Array.prototype.sort,
])

const pushFieldOp = (
  changes: ChangeSet,
  field: number,
  value: unknown,
  traverse?: string[],
) => {
  if (traverse === undefined) {
    changes.fields[field] = { value, field }
  } else {
    changes.fields[`${field},${traverse.join(",")}`] = {
      value,
      field,
      traverse: traverse.slice(),
    }
  }
  changes.fieldsCount++
}

const pushArrayOp = (
  changes: ChangeSet,
  field: number,
  index: number,
  insert: any[] | null,
  remove: number,
  traverse: string[],
) =>
  changes.arrays.push({
    field,
    index,
    insert,
    remove,
    traverse,
  })

type ObservedProps<
  T extends ModelNodeBase = ModelNodeBase,
  P = { [key: string]: any }
> = {
  __lock__: boolean
  __self__: any
  __cache__: ChangeSet
  __index__: string
  __parent__: any
  __type__: T
} & P

const recordIsCollection = (
  record: ModelNodeBase,
): record is ModelNodeCollection =>
  record.kind === ModelNodeKind.Array || record.kind === ModelNodeKind.Map
const recordIsCollectionDescendant = (record: ModelNode) =>
  record.inCollection === true

const tmpTraverse: string[] = []
const buildTraverse = (target: ObservedProps, init?: string) => {
  mutableEmpty(tmpTraverse)
  if (init !== undefined) {
    tmpTraverse.push(init)
  }
  let parent = target
  while (parent !== undefined) {
    const { __parent__, __index__ } = parent
    if (__index__ !== undefined) {
      tmpTraverse.unshift(__index__)
    }
    parent = __parent__
  }
  return tmpTraverse
}

export type Observer = {
  changes: WeakMap<object, ChangeSet>
  observe<T extends object>(object: T, type: ModelNode): T
  reset(object: object): void
}

export function createObserver(): Observer {
  const proxies = new WeakMap<object, ObservedProps>()
  const changes = new WeakMap<object, ChangeSet>()
  const handlerForNestedCollection = {
    get(target: ObservedProps<ModelNodeCollection>, key: string): any {
      if (key === "__self__") return target
      if (
        key === "length" ||
        target.__type__.edge.kind === ModelNodeKind.Primitive
      ) {
        return target[key]
      }
      const value = target[key]
      value.__index__ = key
      value.__parent__ = target
      return inner(value, target, key)
    },
    set(target: ObservedProps<ModelNodeCollection>, key: string, value: any) {
      if (target.__lock__) {
        return true
      }
      pushFieldOp(
        changes.get(target)!,
        target.__type__.edge.kind,
        value,
        buildTraverse(target, key),
      )
      target[key] = value
      return true
    },
  }

  const handlerForCollectionDescendant = {
    get(target: ObservedProps<ModelNodeStruct>, key: string): any {
      if (key === "__self__") return target
      const type = target.__type__.keys[key]
      if (type === undefined || type.kind === ModelNodeKind.Primitive) {
        return target[key]
      }
      const value = target[key]
      value.__parent__ = target
      return inner(value, target, key)
    },
    set(target: ObservedProps<ModelNodeStruct>, key: string, value: any) {
      pushFieldOp(
        changes.get(target)!,
        target.__type__.idsByKey[key],
        value,
        buildTraverse(target),
      )
      target[key] = value
      return true
    },
  }

  const handlerForCollection = {
    get(target: ObservedProps<ModelNodeCollection>, key: string): any {
      if (key === "__self__") return target
      if (
        key === "length" ||
        target.__type__.edge.kind === ModelNodeKind.Primitive
      ) {
        return target[key]
      }
      const value = target[key]
      value.__index__ = key
      return inner(value, target, key)
    },
    set(target: ObservedProps<ModelNodeCollection>, key: string, value: any) {
      if (target.__lock__) return true
      target[key] = value
      pushFieldOp(
        changes.get(target)!,
        target.__type__.edge.id,
        value,
        buildTraverse(target, key),
      )
      return true
    },
  }

  const handlerForStruct = {
    get(target: ObservedProps<ModelNodeStruct>, key: string): any {
      if (key === "__self__") return target
      const type = target.__type__.keys[key]
      if (type === undefined || type.kind === ModelNodeKind.Primitive) {
        return target[key]
      }
      return inner(target[key], target, key)
    },
    set(target: ObservedProps<ModelNodeStruct>, key: string, value: any) {
      target[key] = value
      pushFieldOp(target.__cache__, target.__type__.idsByKey[key], value)
      return true
    },
  }

  const handlerForArrayMethod = {
    apply(
      target: ObservedProps<ModelNodeBase, Function>,
      observed: ObservedProps,
      args: any[],
    ) {
      const self = observed.__self__

      if (MUT_ARRAY_METHODS.has(target)) {
        const changeset = changes.get(self)!
        const field = self.__type__.id
        const traverse = buildTraverse(target)

        self.__lock__ = true
        target.apply(self, args)

        switch (target as Function) {
          case Array.prototype.push: {
            const head = (self as any[]).length - 1
            pushArrayOp(changeset, field, head, args, 0, traverse)
            break
          }
          case Array.prototype.pop: {
            const head = (self as any[]).length - 1
            pushArrayOp(changeset, field, head, null, 1, traverse)
            break
          }
          case Array.prototype.shift:
            pushArrayOp(changeset, field, 0, null, 1, traverse)
            break
          case Array.prototype.unshift:
            pushArrayOp(changeset, field, 0, args, 0, traverse)
            break
          case Array.prototype.splice: {
            switch (args.length) {
              case 0:
                break
              case 1:
                pushArrayOp(changeset, field, args[0], null, 0, traverse)
                break
              case 2:
                pushArrayOp(changeset, field, args[0], null, args[1], traverse)
                break
              default:
                pushArrayOp(
                  changeset,
                  field,
                  args[0],
                  args.slice(2),
                  args[1],
                  traverse,
                )
                break
            }
            break
          }
          case Array.prototype.sort:
            pushArrayOp(changeset, field, 0, self, self.length, traverse)
            break
        }

        self.__lock__ = false
      } else {
        target.apply(self, args)
      }
    },
  }

  const init = (
    observed: ObservedProps,
    type: ModelNode,
    changeset: ChangeSet = { fieldsCount: 0, fields: {}, arrays: [] },
  ) => {
    let handler

    if (MUT_ARRAY_METHODS.has((observed as unknown) as Function)) {
      handler = handlerForArrayMethod
    } else if (recordIsCollection(type) && recordIsCollectionDescendant(type)) {
      handler = handlerForNestedCollection
    } else if (recordIsCollection(type)) {
      handler = handlerForCollection
    } else if (recordIsCollectionDescendant(type)) {
      handler = handlerForCollectionDescendant
    } else {
      handler = handlerForStruct
    }

    observed.__type__ = type
    observed.__lock__ = false
    observed.__cache__ = changeset
    // changes.set(observed, changeset)
    return new Proxy(observed, handler)
  }

  const inner = (
    observed: ObservedProps,
    parent: ObservedProps,
    key?: string,
  ) => {
    let proxy = proxies.get(observed)
    if (proxy === undefined) {
      const type =
        "keys" in parent.__type__!
          ? // struct
            (parent.__type__ as ModelNodeStruct).keys[key as string]
          : // only other option is collection because a parent will never be
            // a primitive type
            (parent.__type__ as ModelNodeCollection).edge
      proxy = init(observed, type, changes.get(parent))
      proxies.set(observed, proxy)
    }

    return proxy
  }

  const observe = <T extends object>(object: T, type: ModelNode): T => {
    let proxy = proxies.get(object)
    if (proxy === undefined) {
      proxy = init(object as ObservedProps, type)
      proxies.set(object, proxy)
    }
    return proxy as T
  }

  const reset = (object: object) => {
    const changeset = changes.get(object)
    if (changeset === undefined) {
      return
    }
    for (const prop in changeset.fields) {
      changeset.fields[prop] = NO_OP
    }
    mutableEmpty(changeset.arrays)
    changeset.fieldsCount = 0
  }

  return {
    changes,
    observe,
    reset,
  }
}
