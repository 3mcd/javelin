import {
  $kind,
  assert,
  CollatedNode,
  FieldKind,
  isField,
  isSimple,
  Model,
  mutableEmpty,
} from "@javelin/core"
import { Component } from "./component"
import { UNSAFE_internals } from "./internal"

export const $touched = Symbol("javelin_proxy_touched")
export const $self = Symbol("javelin_proxy_self")
export const $type = Symbol("javelin_proxy_node")
export const $changes = Symbol("javelin_proxy_changes")
export const $delete = Symbol("javelin_proxy_deleted")

export type Changes =
  | StructChanges
  | ArrayChanges
  | ObjectChanges
  | MapChanges
  | SetChanges

export type StructChanges = { [key: string]: unknown }
export type ArrayChanges = StructChanges
export type ObjectChanges = { [key: string]: typeof $delete | unknown }
export type SetChanges = { add: unknown[]; delete: unknown[] }
export type MapChanges = Map<unknown, typeof $delete | unknown>

type ObservedBase = { [$type]: CollatedNode; [$touched]: boolean }
export type ObservedStruct = ObservedBase & {
  [$self]: ObservedStruct
  [$changes]: StructChanges
  [key: string]: unknown
}
export type ObservedArray = ObservedBase & {
  [$self]: ObservedArray
  [$changes]: ArrayChanges
  [key: number]: unknown
}
export type ObservedObject = ObservedBase & {
  [$self]: ObservedObject
  [$changes]: ObjectChanges
  [key: string]: unknown
}
export type ObservedSet = Set<unknown> &
  ObservedBase & {
    [$self]: ObservedSet
    [$changes]: SetChanges
  }
export type ObservedMap = Map<unknown, unknown> &
  ObservedBase & {
    [$self]: ObservedMap
    [$changes]: MapChanges
  }

export type Observed =
  | ObservedStruct
  | ObservedArray
  | ObservedObject
  | ObservedSet
  | ObservedMap

const proxies = new WeakMap<object, Observed>()

const simpleStructHandler: ProxyHandler<ObservedStruct> = {
  get(target, key: string) {
    target[$touched] = true
    return target[key as keyof typeof target]
  },
  set(target, key: string, value) {
    target[key as keyof typeof target] = value
    target[$changes][key] = value
    return true
  },
}
const structHandler: ProxyHandler<ObservedStruct> = {
  get(target, key: string) {
    const value = target[key]
    target[$touched] = true
    if (typeof value === "object" && value !== null) {
      return proxify(value, target[$type], key)
    }
    return value
  },
  set: simpleStructHandler.set,
}
const simpleArrayHandler = simpleStructHandler
const arrayHandler: ProxyHandler<ObservedArray> = {
  get: structHandler.get,
  set: simpleArrayHandler.set,
}
const simpleObjectHandler: ProxyHandler<ObservedObject> = {
  ...simpleStructHandler,
  deleteProperty(target, key: string) {
    delete target[key as keyof typeof target]
    target[$changes][key] = $delete
    return true
  },
}
const objectHandler: ProxyHandler<ObservedObject> = {
  ...structHandler,
  deleteProperty: simpleObjectHandler.deleteProperty,
}
const setHandler: ProxyHandler<ObservedSet> = {
  get(target, key) {
    const value = target[key as keyof typeof target]
    target[$touched] = true
    if (typeof value === "function") {
      return new Proxy(value, setMethodHandler)
    }
    return value
  },
}
const setMethodHandler: ProxyHandler<Function> = {
  apply(method, target: ObservedSet, args) {
    const { [$self]: self } = target
    switch (method) {
      case Set.prototype.add:
        self[$changes].add.push(args[0])
        break
      case Set.prototype.delete:
        self[$changes].delete.push(args[0])
        break
      case Set.prototype.clear:
        self.forEach(value => self[$changes].delete.push(value))
        break
    }
    return method.apply(self, args)
  },
}
const mapHandler: ProxyHandler<ObservedMap> = {
  get(target, key, receiver) {
    const value = Reflect.get(target, key, receiver)
    target[$touched] = true
    if (typeof value === "function") {
      return new Proxy(value, mapMethodHandler)
    }
    return value
  },
}
const mapMethodHandler: ProxyHandler<Function> = {
  apply(method, target: ObservedMap, args) {
    const { [$self]: self } = target
    switch (method) {
      case Map.prototype.get: {
        const value = method.apply(self, args as [key: unknown])
        self[$touched] = true
        if (typeof value === "object" && value !== null) {
          return proxify(value, self[$type], args[0])
        }
      }
      case Map.prototype.set:
        self[$changes].set(args[0], args[1])
        break
      case Map.prototype.delete:
        self[$changes].set(args[0], $delete)
        break
      case Map.prototype.clear:
        self.forEach((_, key) => self[$changes].set(key, $delete))
        return self.clear()
    }
    return method.apply(self, args)
  },
}

function getHandler(node: CollatedNode): ProxyHandler<Observed> {
  const simple = isSimple(node)
  if (isField(node)) {
    switch (node[$kind]) {
      case FieldKind.Array:
        return simple ? simpleArrayHandler : arrayHandler
      case FieldKind.Object:
        return simple ? simpleObjectHandler : objectHandler
      case FieldKind.Set:
        return setHandler
      case FieldKind.Map:
        return mapHandler
      default:
        throw new Error(
          "Failed to observe object: cannot observe a primitive type",
        )
    }
  }
  return simple ? simpleStructHandler : structHandler
}

function getChanges(node: CollatedNode): Changes {
  if (isField(node)) {
    switch (node[$kind]) {
      case FieldKind.Array:
        return { changes: {} }
      case FieldKind.Object:
        return { changes: {} }
      case FieldKind.Set:
        return { add: [], delete: [] }
      case FieldKind.Map:
        return { changes: new Map() }
    }
  }
  return { changes: {} }
}

const descriptorBase = {
  configurable: false,
  enumerable: false,
  writable: false,
}

function register(object: object, node: CollatedNode): Observed {
  Object.defineProperties(object as Observed, {
    [$self]: {
      ...descriptorBase,
      value: object,
    },
    [$type]: {
      ...descriptorBase,
      value: node,
    },
    [$changes]: {
      ...descriptorBase,
      value: getChanges(node),
    },
  })
  const proxy = new Proxy(object as Observed, getHandler(node))
  proxies.set(object, proxy)
  return proxy
}

function proxify(object: object, parent: CollatedNode, key: string) {
  let node: CollatedNode
  if (!isField(parent)) {
    node = parent.fieldsByKey[key]
  } else {
    assert("element" in parent)
    node = parent.element as CollatedNode
  }
  return proxies.get(object) ?? register(object, node)
}

export function observe<T extends Component>(component: T): T {
  return (proxies.get(component) ??
    register(
      component,
      UNSAFE_internals.model[component.__type__],
    )) as unknown as T
}

function clearInner(object: object, node: CollatedNode) {
  if ((object as Observed)[$touched] !== true) {
    return
  }
  const changes = (object as Observed)[$changes]
  if (!isField(node)) {
    for (const prop in changes) {
      delete (changes as StructChanges)[prop]
    }
    for (let i = 0; i < node.fields.length; i++) {
      clearInner(
        (object as Record<string, object>)[node.keys[i]],
        node.fields[i],
      )
    }
  } else if ("element" in node) {
    const element = node.element as CollatedNode
    switch (node[$kind]) {
      case FieldKind.Array: {
        for (const prop in changes) {
          delete (changes as ArrayChanges)[prop]
        }
        for (let i = 0; i < (object as object[]).length; i++) {
          clearInner((object as object[])[i], element)
        }
        break
      }
      case FieldKind.Object: {
        for (const prop in changes) {
          delete (changes as ObjectChanges)[prop]
        }
        for (const prop in object) {
          clearInner((object as Record<string, object>)[prop], element)
        }
        break
      }
      case FieldKind.Set: {
        mutableEmpty((changes as SetChanges).add)
        mutableEmpty((changes as SetChanges).delete)
        break
      }
      case FieldKind.Map: {
        ;(changes as MapChanges).clear()
        ;(object as ObservedMap).forEach((key, value) =>
          clearInner(value as object, element),
        )
        break
      }
    }
  }
  ;(object as Observed)[$touched] = false
}

export function clear(component: Component) {
  const node = UNSAFE_internals.model[component.__type__]
  return clearInner(component, node)
}

type FieldRef = { ref: unknown; key: string | number | null }
const tmpFieldRef: FieldRef = { ref: null, key: null }

export function getFieldRef(
  model: Model,
  component: Component,
  fieldId: number,
  traverse: string[],
) {
  const type = model[component.__type__]
  let t = 0
  let key: string | number | null = null
  let ref = component
  let node: CollatedNode = type as CollatedNode
  outer: while (node.id !== fieldId) {
    if (isField(node)) {
      assert("element" in node)
      key = traverse[t++]
      switch (node[$kind]) {
        case FieldKind.Array:
        case FieldKind.Object:
          ref = ref[key!] as Component
          break
        case FieldKind.Map:
          ref = (ref as unknown as Map<unknown, unknown>).get(key) as Component
          break
        default:
          throw new Error("Failed to apply change: invalid target field")
      }
      node = node.element as CollatedNode
    } else {
      for (let i = 0; i < node.fields.length; i++) {
        const child = node.fields[i]
        if (child.lo <= fieldId && child.hi >= fieldId) {
          key = node.keys[i]
          node = child
          if (node.id !== fieldId) {
            ref = (ref as any)[key]
          }
          continue outer
        }
      }
    }
  }
  tmpFieldRef.ref = ref
  tmpFieldRef.key = key
  return tmpFieldRef
}

export function apply(
  model: Model,
  component: Component,
  fieldId: number,
  traverse: string[],
  value: unknown,
) {
  const { key, ref } = getFieldRef(model, component, fieldId, traverse)
  ;(ref as any)[key!] = value as any
}
