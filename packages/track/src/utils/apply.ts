import { assert, CollatedNode, ErrorType, isField } from "@javelin/core"
import { Component, ComponentOf, UNSAFE_internals } from "@javelin/ecs"
import { ChangeSet } from "../components"
import { MutArrayMethod } from "../types"

const ERROR_PATCH_NO_MATCH =
  "Failed to patch component: reached leaf before finding field"

type FieldRef = { ref: unknown; key: string | number | null }
const tmpFieldRef: FieldRef = { ref: null, key: null }

export function findFieldRef(
  component: Component,
  fieldId: number,
  traverse: string[],
) {
  const type = UNSAFE_internals.model[component.__type__]
  let traverseIndex = 0
  let key: string | number | null = null
  let ref = component
  let node: CollatedNode = type as CollatedNode
  outer: while (node.id !== fieldId) {
    if (key !== null) {
      ref = ref[key] as any
    }
    if (!isField(node)) {
      for (let i = 0; i < node.fields.length; i++) {
        const child = node.fields[i]
        if (child.lo <= fieldId && child.hi >= fieldId) {
          key = node.keys[i]
          node = child
          continue outer
        }
      }
    } else {
      assert("element" in node, ERROR_PATCH_NO_MATCH)
      key = traverse[traverseIndex++]
      node = node.element as CollatedNode
      continue
    }
  }
  tmpFieldRef.ref = ref
  tmpFieldRef.key = key
  return tmpFieldRef
}

export function applyArrayMethod(
  component: Component,
  method: MutArrayMethod,
  field: number,
  traverse: string[],
  index?: number,
  remove?: number,
  values?: unknown[],
) {
  const { key, ref } = findFieldRef(component, field, traverse)
  assert(key !== null, "", ErrorType.Internal)
  const array = ref as unknown[]
  switch (method) {
    case MutArrayMethod.Pop:
      return array.pop()
    case MutArrayMethod.Shift:
      return array.shift()
    case MutArrayMethod.Push:
      return array.push(...(values as unknown[]))
    case MutArrayMethod.Unshift:
      return array.unshift(...(values as unknown[]))
    case MutArrayMethod.Splice:
      return array.splice(index as number, remove as number, values)
  }
}

export function applyChange(
  component: Component,
  fieldId: number,
  traverse: string[],
  value: unknown,
) {
  const { key, ref } = findFieldRef(component, fieldId, traverse)
  assert(key !== null, "", ErrorType.Internal)
  ;(ref as Record<string, unknown>)[key] = value as any
}

export function apply(
  changeset: ComponentOf<typeof ChangeSet>,
  component: Component,
) {
  if (changeset.size === 0) {
    return
  }
  const source = changeset.changes[component.__type__]
  if (source.fieldCount > 0) {
    for (const prop in source.fields) {
      const patch = source.fields[prop]
      if (patch.noop) {
        continue
      }
      const {
        record: { field, traverse },
        value,
      } = patch
      applyChange(component, field, traverse, value)
    }
  }
  for (let i = 0; i < source.arrayCount; i++) {
    const {
      method,
      start,
      deleteCount,
      values,
      record: { field, traverse },
    } = source.array[i]
    applyArrayMethod(
      component,
      method,
      field,
      traverse,
      start,
      deleteCount,
      values,
    )
  }
}
