import {
  $schema,
  assert,
  ErrorType,
  ModelNode,
  SchemaKeyKind,
} from "@javelin/core"
import { Component, ComponentOf, UNSAFE_internals } from "@javelin/ecs"
import { ChangeSet } from "../components"

const ERROR_PATCH_NO_MATCH =
  "Failed to patch component: reached leaf before finding field"
const ERROR_PATCH_UNSUPPORTED_TYPE =
  "Failed to patch component: only primitive types are currently supported"

export function applyPatchToComponent(
  component: Component,
  field: number,
  traverse: number[],
  value: unknown,
) {
  const type = UNSAFE_internals.model[component.__type__]
  let traverseIndex = 0
  let key: string | number | null = null
  let ref = component
  let node: ModelNode = type as ModelNode
  outer: while (node.id !== field) {
    if (key !== null) {
      ref = ref[key]
    }
    switch (node.kind) {
      case SchemaKeyKind.Primitive:
        throw new Error(ERROR_PATCH_NO_MATCH)
      case SchemaKeyKind.Array:
      case SchemaKeyKind.Object:
      case SchemaKeyKind.Set:
      case SchemaKeyKind.Map:
        key = traverse[traverseIndex++]
        node = node.edge
        continue
      case $schema:
        for (let i = 0; i < node.edges.length; i++) {
          const child = node.edges[i]
          if (child.lo <= field && child.hi >= field) {
            key = child.key
            node = child
            continue outer
          }
        }
      default:
        throw new Error(ERROR_PATCH_NO_MATCH)
    }
  }
  assert(key !== null, "", ErrorType.Internal)
  assert(node.kind === SchemaKeyKind.Primitive, ERROR_PATCH_UNSUPPORTED_TYPE)
  ref[key] = value
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
