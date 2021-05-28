import {
  $kind,
  assert,
  CollatedNode,
  CollatedNodeSchema,
  createStackPool,
  FieldKind,
  isField,
  isPrimitiveField,
  isSimple,
  mutableEmpty,
} from "@javelin/core"
import {
  $changes,
  $touched,
  Component,
  Entity,
  Observed,
  StructChanges,
  ArrayChanges,
  ObjectChanges,
  SetChanges,
  $delete,
} from "@javelin/ecs"
import {
  ByteView,
  encode,
  ModelEnhanced,
  string16,
  uint16,
  uint32,
  uint8,
  write,
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
    const schemaId = component.__type__
    const encoded = encode(component, model[schemaId])
    insert(op, schemaId, uint8)
    insert(op, encoded)
  }
  return op
}

/**
 * Create an attach message op.
 * @example
 * [
 *   entity: uint32,
 *   count: uint8,
 *   components: [schemaId: uint8, length: uint16, encoded: *][],
 * ]
 * @param entity
 * @param components
 * @returns MessageOp
 */
export const attach = snapshot
/**
 * Create a update message op.
 * @example
 * [
 *   entity: uint32,
 *   count: uint8,
 *   components: [schemaId: uint8, length: uint16, encoded: *][],
 * ]
 * @param entity
 * @param components
 * @returns MessageOp
 */
export const update = snapshot

function patchInner(
  op: MessageOp,
  node: CollatedNode<ByteView>,
  object: object,
  acc = 0,
  key?: string | number,
): number {
  insert(op, node.id, uint8)
  if (key !== undefined) {
    assert("key" in node)
    insert(op, key, node.key as ByteView)
  }
  const changes = (object as Observed)[$changes]
  // write changes
  if (!isField(node)) {
    for (const prop in changes) {
      const child = node.fieldsByKey[prop]
      const value = (changes as StructChanges)[prop]
      if (isField(child) && isPrimitiveField(child)) {
        insert(op, value, child)
      } else {
        insert(op, encode(value, node))
      }
      acc++
    }
  } else if ("element" in node) {
    const element = node.element as CollatedNode<ByteView>
    switch (node[$kind]) {
      case FieldKind.Array:
        for (const prop in changes) {
          const value = (changes as ArrayChanges)[prop]
          if (isField(element) && isPrimitiveField(element)) {
            insert(op, value, element)
          } else {
            insert(op, encode(value, node))
          }
        }
        acc++
        break
    }
  }
  // skip nested check if simple
  if (isSimple(node)) return acc
  // recurse
  if (!isField(node)) {
    for (let i = 0; i < node.fields.length; i++) {
      const child = node.fields[i]
      const ref = (object as Record<string, unknown>)[node.keys[i]]
      if ((ref as Observed)[$touched]) {
        acc = patchInner(op, child, ref as object, acc)
      }
    }
  } else if ("element" in node) {
    const element = node.element as CollatedNode<ByteView>
    switch (node[$kind]) {
      case FieldKind.Array:
        for (let i = 0; i < (object as unknown as unknown[]).length; i++) {
          const value = (object as unknown as unknown[])[i]
          if ((value as Observed)[$touched]) {
            acc = patchInner(op, element, object, i)
          }
        }
        break
    }
  }
  return acc
}

/**
 * Create a patch message op.
 * @param model
 * @param entity
 * @param component
 * @returns MessageOp
 */
export function patch(
  model: ModelEnhanced,
  entity: Entity,
  component: Component,
): MessageOp {
  const op = messageOpPool.retain()
  const type = component.__type__
  if (!(component as unknown as Observed)[$touched]) return op
  insert(op, entity, uint32)
  insert(op, type, uint8)
  const size = insert(op, 0, uint16)
  const root = model[type] as CollatedNode<ByteView>
  modify(op, size, patchInner(op, root, component))
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
