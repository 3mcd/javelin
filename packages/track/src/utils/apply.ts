import {
  $kind,
  assert,
  CollatedNode,
  FieldExtract,
  FieldKind,
  isField,
} from "@javelin/core"
import { Component, ComponentOf, UNSAFE_internals } from "@javelin/ecs"
import { ChangeKind, ChangeSet } from "../components"

const ERROR_APPLY_NO_MATCH =
  "Failed to apply patch: reached leaf before finding field"
const ERROR_APPLY_INVALID_KEY = "Failed to apply patch: encountered invalid key"

type FieldRef = { ref: unknown; key: string | number | null }
const tmpFieldRef: FieldRef = { ref: null, key: null }

export function findFieldRef(
  component: Component,
  fieldId: number,
  traverse: string[],
) {
  const type = UNSAFE_internals.model[component.__type__]
  let t = 0
  let key: string | number | null = null
  let ref = component
  let node: CollatedNode = type as CollatedNode
  outer: while (node.id !== fieldId) {
    if (isField(node)) {
      assert("element" in node, ERROR_APPLY_NO_MATCH)
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
          throw new Error(ERROR_APPLY_INVALID_KEY)
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

export function applyChange(
  component: Component,
  kind: ChangeKind,
  fieldId: number,
  traverse: string[],
  value: unknown,
  key: unknown,
) {
  const { key: _key, ref } = findFieldRef(component, fieldId, traverse)
  switch (kind) {
    case ChangeKind.Assign:
      ;(ref as Record<string, unknown>)[_key!] = value
      break
    case ChangeKind.Set:
      ;(ref as any)[_key!].set(key!, value)
      break
    case ChangeKind.Add:
      ;(ref as Set<unknown>).add(value)
      break
    case ChangeKind.Remove:
      ;(ref as Set<unknown> | Map<unknown, unknown>).delete(key!)
      break
  }
}

export function apply(
  changes: FieldExtract<typeof ChangeSet>,
  component: Component,
) {
  if (changes.noop) return
  const source = changes.changesBySchemaId[component.__type__]
  for (let i = 0; i < source.length; i++) {
    const {
      kind,
      field: { id, traverse },
      value,
      key,
    } = source[i]
    applyChange(component, kind, id, traverse, value, key)
  }
}
