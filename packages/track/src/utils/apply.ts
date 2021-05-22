import { assert, CollatedNode, ErrorType, isField } from "@javelin/core"
import { Component, ComponentOf, UNSAFE_internals } from "@javelin/ecs"
import { ChangeSet } from "../components"

const ERROR_PATCH_NO_MATCH =
  "Failed to patch component: reached leaf before finding field"

export function applyPatchToComponent(
  component: Component,
  fieldId: number,
  traverse: number[],
  value: unknown,
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
  assert(key !== null, "", ErrorType.Internal)
  ref[key] = value as any
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
      applyPatchToComponent(
        component,
        field,
        traverse as unknown as number[],
        value,
      )
    }
  }
  // TODO: support mutating array methods
}
