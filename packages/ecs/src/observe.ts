import {
  $kind,
  assert,
  CollatedNode,
  FieldKind,
  isField,
  isSchema,
  isSimple,
  mutableEmpty,
} from "@javelin/core"
import { Component, getComponentId } from "./component"
import { UNSAFE_internals } from "./internal"

export const $self = Symbol("javelin_proxy_self")
export const $touched = Symbol("javelin_proxy_touched")
export const $changes = Symbol("javelin_proxy_changes")
export const $delete = Symbol("javelin_proxy_deleted")

export type ChangesBase = {
  node: CollatedNode
  dirty: boolean
}
export type StructChanges = ChangesBase & {
  changes: { [key: string]: unknown }
}
export type ArrayChanges = StructChanges
export type ObjectChanges = ChangesBase & {
  changes: { [key: string]: typeof $delete | unknown }
}
export type SetChanges = ChangesBase & {
  changes: { add: unknown[]; delete: unknown[] }
}
export type MapChanges = ChangesBase & {
  changes: Map<unknown, typeof $delete | unknown>
}

export type Changes =
  | StructChanges
  | ArrayChanges
  | ObjectChanges
  | SetChanges
  | MapChanges

type Observed<T = unknown, C = Changes> = {
  [$touched]: boolean
  [$changes]: C
  [$self]: Observed<T, C>
} & T
export type ObservedStruct = Observed<{ [key: string]: unknown }, StructChanges>
export type ObservedArray = Observed<unknown[], ArrayChanges>
export type ObservedObject = Observed<{ [key: string]: unknown }, ObjectChanges>
export type ObservedSet = Observed<Set<unknown>, SetChanges>
export type ObservedMap = Observed<Map<unknown, unknown>, MapChanges>

const proxies = new WeakMap<object, Observed>()

const simpleStructHandler: ProxyHandler<ObservedStruct> = {
  get(target, key: string | symbol) {
    if (key === $self) return target
    target[$touched] = true
    return target[key as keyof typeof target]
  },
  set(target, key: string, value) {
    const changes = target[$changes]
    target[key as keyof typeof target] = value
    target[$touched] = true
    changes.changes[key] = value
    changes.dirty = true
    return true
  },
}
const structHandler: ProxyHandler<ObservedStruct> = {
  get(target, key: string | symbol) {
    if (key === $self) return target
    const value = target[key as keyof typeof target]
    target[$touched] = true
    if (typeof value === "object" && value !== null) {
      return proxify(value, target, key as string)
    }
    return value
  },
  set: simpleStructHandler.set,
}
const simpleArrayHandler =
  simpleStructHandler as unknown as ProxyHandler<ObservedArray>
const arrayHandler: ProxyHandler<ObservedArray> = {
  get: (structHandler as unknown as ProxyHandler<ObservedArray>).get,
  set: simpleArrayHandler.set,
}
const simpleObjectHandler: ProxyHandler<ObservedObject> = {
  ...simpleStructHandler,
  deleteProperty(target, key: string) {
    const changes = target[$changes]
    delete target[key as keyof typeof target]
    target[$touched] = true
    changes.changes[key] = $delete
    changes.dirty = true
    return true
  },
}
const objectHandler: ProxyHandler<ObservedObject> = {
  ...structHandler,
  deleteProperty: simpleObjectHandler.deleteProperty,
}
const setHandler: ProxyHandler<ObservedSet> = {
  get(target, key: string | symbol) {
    if (key === $self) return target
    const value = target[key as keyof typeof target]
    target[$touched] = true
    return typeof value === "function"
      ? new Proxy(value, setMethodHandler)
      : value
  },
}
const setMethodHandler: ProxyHandler<Function> = {
  apply(method, target: ObservedSet, args) {
    const { [$self]: self, [$changes]: changes } = target
    target[$touched] = true
    switch (method) {
      case Set.prototype.add:
        changes.changes.add.push(args[0])
        changes.dirty = true
        break
      case Set.prototype.delete:
        changes.changes.delete.push(args[0])
        changes.dirty = true
        break
      case Set.prototype.clear:
        self.forEach(value => changes.changes.delete.push(value))
        changes.dirty = true
        break
    }
    return method.apply(self, args)
  },
}
const mapHandler: ProxyHandler<ObservedMap> = {
  get(target, key, receiver) {
    if (key === $self) return target
    const value = Reflect.get(target, key, receiver)
    target[$touched] = true
    return typeof value === "function"
      ? new Proxy(value, mapMethodHandler)
      : value
  },
}
const mapMethodHandler: ProxyHandler<Function> = {
  apply(method, target: ObservedMap, args) {
    const { [$self]: self } = target
    const { [$changes]: changes } = self
    self[$touched] = true
    switch (method) {
      case Map.prototype.get: {
        const value = method.apply(self, args as [key: unknown])
        if (typeof value === "object" && value !== null) {
          return proxify(value, self, args[0])
        }
      }
      case Map.prototype.set:
        changes.changes.set(args[0], args[1])
        changes.dirty = true
        break
      case Map.prototype.delete:
        changes.changes.set(args[0], $delete)
        changes.dirty = true
        break
      case Map.prototype.clear:
        self.forEach((_, key) => changes.changes.set(key, $delete))
        changes.dirty = true
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
  const base: ChangesBase = { dirty: false, node }
  if (isField(node)) {
    switch (node[$kind]) {
      case FieldKind.Array:
        return { ...base, changes: {} }
      case FieldKind.Object:
        return { ...base, changes: {} }
      case FieldKind.Set:
        return { ...base, changes: { add: [], delete: [] } }
      case FieldKind.Map:
        return { ...base, changes: new Map() }
    }
  }
  return { ...base, changes: {} }
}

const descriptorBase = {
  configurable: false,
  enumerable: true,
  writable: false,
}

function register(object: object, node: CollatedNode): Observed {
  const changes = getChanges(node)
  const observed: Observed = Object.defineProperties(object as Observed, {
    [$self]: { ...descriptorBase, value: object },
    [$changes]: { ...descriptorBase, value: changes },
  })
  const handler = getHandler(node)
  const proxy = new Proxy(observed, handler)
  proxies.set(object, proxy)
  return proxy
}

function proxify(object: object, parent: Observed, key: string) {
  const parentNode = parent[$changes].node
  let node: CollatedNode
  if (isSchema(parentNode)) {
    node = parentNode.fieldsByKey[key]
  } else {
    assert("element" in parentNode)
    node = parentNode.element as CollatedNode
  }
  return proxies.get(object) ?? register(object, node)
}

export function observe<T extends Component>(component: T): T {
  ;(component as unknown as Observed)[$touched] = true
  return (proxies.get(component) ??
    register(
      component,
      UNSAFE_internals.model[getComponentId(component)],
    )) as unknown as T
}

function clearObservedChangesInner(object: Observed, node: CollatedNode) {
  if (object[$touched] !== true) {
    return
  }
  const changes = object[$changes]
  if (isSchema(node)) {
    for (const prop in changes.changes) {
      delete (changes as StructChanges).changes[prop]
    }
    for (let i = 0; i < node.fields.length; i++) {
      clearObservedChangesInner(
        (object as Record<string, Observed>)[node.keys[i]],
        node.fields[i],
      )
    }
  } else if ("element" in node) {
    const element = node.element as CollatedNode
    switch (node[$kind]) {
      case FieldKind.Array: {
        for (const prop in changes.changes) {
          delete (changes as ArrayChanges).changes[prop]
        }
        for (let i = 0; i < (object as unknown as Observed[]).length; i++) {
          clearObservedChangesInner(
            (object as unknown as Observed[])[i],
            element,
          )
        }
        break
      }
      case FieldKind.Object: {
        for (const prop in changes.changes) {
          delete (changes as ObjectChanges).changes[prop]
        }
        for (const prop in object) {
          clearObservedChangesInner(
            (object as Record<string, Observed>)[prop],
            element,
          )
        }
        break
      }
      case FieldKind.Set: {
        mutableEmpty((changes as SetChanges).changes.add)
        mutableEmpty((changes as SetChanges).changes.delete)
        break
      }
      case FieldKind.Map: {
        ;(changes as MapChanges).changes.clear()
        ;(object as ObservedMap).forEach(value =>
          clearObservedChangesInner(value as Observed, element),
        )
        break
      }
    }
  }
  changes.dirty = false
  object[$touched] = false
}

export function clearObservedChanges(
  component: Component | Observed<Component, unknown>,
) {
  const self = $self in component ? (component as Observed)[$self] : component
  const node = UNSAFE_internals.model[getComponentId(self)]
  return clearObservedChangesInner(self as unknown as Observed, node)
}

export function getFieldValue(
  node: CollatedNode,
  object: object,
  fieldId: number,
  traverse: (number | string)[],
) {
  let t = 0
  let key: string | number | null = null
  let ref = object
  outer: while (node.id !== fieldId) {
    if (isField(node)) {
      assert("element" in node)
      key = traverse[t++]
      switch (node[$kind]) {
        case FieldKind.Array:
        case FieldKind.Object:
          ref = (ref as Record<string, unknown>)[key!] as Component
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
            ref = (ref as Record<string, object>)[key]
          }
          continue outer
        }
      }
    }
  }
  return ref
}

export type PatchNode = {
  changes: Map<unknown, unknown>
  children: Map<unknown, PatchNode>
}
export type Patch = PatchNode & { schemaId: number }

function createPatchInner(
  object: object,
  patch: PatchNode = { changes: new Map(), children: new Map() },
): PatchNode {
  const self = (object as Observed)[$self]
  const {
    [$changes]: { node, changes },
  } = self
  const simple = isSimple(node)
  if (isSchema(node)) {
    if (simple) {
      for (let i = 0; i < node.fields.length; i++) {
        const key = node.keys[i]
        if (key in changes)
          patch.changes.set(key, (self as ObservedStruct)[key])
      }
    } else {
      for (let i = 0; i < node.fields.length; i++) {
        const key = node.keys[i]
        const value = (self as ObservedStruct)[key]
        if (key in changes) patch.changes.set(key, value)
        if ((value as Observed)[$touched]) {
          patch.children.set(
            key,
            createPatchInner(value as Observed, patch.children.get(key)),
          )
        }
      }
    }
  } else if ("element" in node) {
    switch (node[$kind]) {
      case FieldKind.Array:
        if (simple) {
          for (let i = 0; i < (self as unknown as Observed[]).length; i++) {
            if (i in changes)
              patch.changes.set(i, (self as unknown as Observed[])[i])
          }
        } else {
          for (let i = 0; i < (self as unknown as Observed[]).length; i++) {
            const value = (self as unknown as Observed[])[i]
            if (i in changes) patch.changes.set(i, value)
            if ((value as Observed)[$touched])
              patch.children.set(
                i,
                createPatchInner(value, patch.children.get(i)),
              )
          }
        }
        break
      case FieldKind.Map:
        if (simple) {
          ;(changes as Map<unknown, unknown>).forEach((value, key) =>
            patch.changes.set(key, value),
          )
        } else {
          ;(self as unknown as Map<unknown, Observed>).forEach((value, key) => {
            if ((changes as Map<unknown, unknown>).has(key)) {
              patch.changes.set(key, value)
              if (value[$touched])
                patch.children.set(
                  key,
                  createPatchInner(value, patch.children.get(key)),
                )
            }
          })
        }
        break
    }
  }
  return patch
}
export function createPatch(
  component: Component,
  patch: Patch = {
    schemaId: getComponentId(component),
    children: new Map(),
    changes: new Map(),
  },
) {
  if ($changes in component) {
    createPatchInner(component, patch)
  }
  return patch
}

export function resetPatch(patch: Patch) {
  patch.changes.clear()
  patch.children.clear()
}
