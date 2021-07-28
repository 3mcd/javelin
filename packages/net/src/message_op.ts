import {
  $kind,
  assert,
  CollatedNode,
  createStackPool,
  FieldKind,
  isPrimitiveField,
  isSchema,
  isSimple,
  mutableEmpty,
} from "@javelin/core"
import { Component, Entity, getSchemaId, Patch, PatchNode } from "@javelin/ecs"
import {
  ByteView,
  encode,
  ModelEnhanced,
  uint16,
  uint32,
  uint8,
} from "@javelin/pack"
import { encodeModel } from "./model"

export const $buffer = Symbol("javelin_array_buffer")

export type MessageOp = {
  data: unknown[]
  view: (ByteView | typeof $buffer)[]
  byteLength: number
}

export function createOp(): MessageOp {
  return {
    data: [],
    view: [],
    byteLength: 0,
  }
}

export function resetOp(op: MessageOp): MessageOp {
  mutableEmpty(op.data)
  mutableEmpty(op.view)
  op.byteLength = 0
  return op
}

export const messageOpPool = createStackPool(createOp, resetOp, 1000)

export function insert(op: MessageOp, data: ArrayBuffer): number
export function insert(op: MessageOp, data: unknown, view: ByteView): number
export function insert(op: MessageOp, data: unknown, view?: ByteView) {
  op.data.push(data)
  op.view.push(view ?? $buffer)
  op.byteLength += view ? view.byteLength : (data as ArrayBuffer).byteLength
  return op.data.length - 1
}

export function modify(op: MessageOp, index: number, data: unknown) {
  const current = op.data[index]
  const view = op.view[index]
  op.data[index] = data
  if (view === $buffer) {
    op.byteLength +=
      (data as ArrayBuffer).byteLength - (current as ArrayBuffer).byteLength
  }
}

/**
 * Create a snapshot message op.
 * @example
 * [
 *   entity: uint32,
 *   count: uint8,
 *   components: [schemaId: uint8, encoded: *][],
 * ]
 * @param entity
 * @param components
 * @returns MessageOp
 */
export function snapshot(
  model: ModelEnhanced,
  entity: Entity,
  components: Component[],
): MessageOp {
  const op = messageOpPool.retain()
  const count = components.length
  insert(op, entity, uint32)
  insert(op, count, uint8)
  for (let i = 0; i < count; i++) {
    const component = components[i]
    const schemaId = getSchemaId(component)
    const encoded = encode(component, model[schemaId])
    insert(op, schemaId, uint8)
    insert(op, encoded)
  }
  return op
}

function patchInner(
  op: MessageOp,
  node: CollatedNode<ByteView>,
  patch: PatchNode,
  total = 0,
  traverse?: [number | string, ByteView][],
) {
  const { changes, children } = patch
  const { size } = changes
  if (size > 0) {
    insert(op, node.id, uint8)
    insert(op, traverse?.length ?? 0, uint8)
    if (traverse !== undefined) {
      for (let i = 0; i < traverse.length; i++) {
        const [traverseKey, traverseView] = traverse[i]
        insert(op, traverseKey, traverseView)
      }
    }
    insert(op, size, uint8)
    if (isSchema(node)) {
      changes.forEach((value, key) => {
        const child = node.fieldsByKey[key as string]
        insert(op, child.id, uint8)
        if (isPrimitiveField(child)) {
          insert(op, value, child)
        } else {
          insert(op, encode(value, child))
        }
      })
    } else {
      assert("element" in node)
      const element = node.element as CollatedNode<ByteView>
      switch (node[$kind]) {
        case FieldKind.Array:
          changes.forEach((value, key) => {
            if (key === "length") return
            insert(op, Number(key), uint16)
            if (isPrimitiveField(element)) {
              insert(op, value, element)
            } else {
              insert(op, encode(value, element))
            }
          })
          break
      }
    }
  }
  if (!isSimple(node)) {
    if (isSchema(node)) {
      children.forEach((changes, key) => {
        total = patchInner(
          op,
          node.fieldsByKey[key as string],
          changes,
          total,
          traverse,
        )
      })
    } else {
      assert("element" in node)
      const element = node.element as CollatedNode<ByteView>
      children.forEach(
        changes => (total = patchInner(op, element, changes, total, traverse)),
      )
    }
  }
  return total + 1
}

/**
 * Create a patch message op.
 * [entity, schemaId, [field, traverse, [operation, ...args]*]*]
 * @param model
 * @param entity
 * @param schemaId
 * @param patch
 * @returns MessageOp
 */
export function patch(
  model: ModelEnhanced,
  entity: Entity,
  patch: Patch,
): MessageOp {
  const op = messageOpPool.retain()
  const { schemaId } = patch
  const root = model[schemaId] as CollatedNode<ByteView>
  insert(op, entity, uint32)
  insert(op, schemaId, uint8)
  modify(op, insert(op, 0, uint8), patchInner(op, root, patch))
  return op
}

/**
 * Create a detach message op.
 * @example
 * [
 *   entity: uint32,
 *   count: uint8,
 *   schemaIds: uint8[],
 * ]
 * @param entity
 * @param schemaIds
 * @returns MessageOp
 */
export function detach(entity: Entity, schemaIds: number[]): MessageOp {
  const op = messageOpPool.retain()
  const count = schemaIds.length
  insert(op, entity, uint32)
  insert(op, count, uint8)
  for (let i = 0; i < count; i++) {
    insert(op, schemaIds[i], uint8)
  }
  return op
}

/**
 * Create a destroy message op.
 * @example
 * [
 *   entity: uint32,
 * ]
 * @param entity
 * @returns MessageOp
 */
export function destroy(entity: Entity): MessageOp {
  const op = messageOpPool.retain()
  insert(op, entity, uint32)
  return op
}

/**
 * Create a model message op.
 * @example
 * [
 *   model: *,
 * ]
 * @param model
 * @returns MessageOp
 */
export function model(model: ModelEnhanced): MessageOp {
  const op = messageOpPool.retain()
  insert(op, encodeModel(model))
  return op
}
