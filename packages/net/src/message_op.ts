import {
  $kind,
  CollatedNode,
  createStackPool,
  FieldKind,
  isPrimitiveField,
  isSchema,
  isSimple,
  mutableEmpty,
} from "@javelin/core"
import {
  $changes,
  $touched,
  ArrayChanges,
  Component,
  Entity,
  Observed,
  StructChanges,
} from "@javelin/ecs"
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
    const schemaId = component.__type__
    const encoded = encode(component, model[schemaId])
    insert(op, schemaId, uint8)
    insert(op, encoded)
  }
  return op
}

function patchInner(
  op: MessageOp,
  node: CollatedNode<ByteView>,
  object: object,
  total = 0,
  traverse?: [number | string, ByteView][],
) {
  const changes = (object as Observed)[$changes]
  if (changes?.dirty) {
    total++
    // parent node
    insert(op, node.id, uint8)
    // traverse length
    insert(op, traverse?.length ?? 0, uint8)
    // traverse
    if (traverse !== undefined) {
      for (let i = 0; i < traverse.length; i++) {
        insert(op, traverse[i][0], traverse[i][1])
      }
    }
    // count
    const count = insert(op, 0, uint8)
    // changes
    let hits = 0
    if (isSchema(node)) {
      for (const prop in changes.changes) {
        const child = node.fieldsByKey[prop]
        const value = (changes as StructChanges).changes[prop]
        // child field
        insert(op, child.id, uint8)
        // value
        if (isPrimitiveField(child)) {
          insert(op, value, child)
        } else {
          insert(op, encode(value, child))
        }
        hits++
      }
    } else if ("element" in node) {
      const child = node.element as CollatedNode<ByteView>
      switch (node[$kind]) {
        case FieldKind.Array:
          for (const prop in changes.changes) {
            if (prop === "length") continue
            const value = (changes as ArrayChanges).changes[prop]
            // key
            insert(op, +prop, uint16)
            // value
            if (isPrimitiveField(child)) {
              insert(op, value, child)
            } else {
              insert(op, encode(value, child))
            }
            hits++
          }
          break
      }
    }
    modify(op, count, hits)
  }
  // skip nested check if simple
  if (isSimple(node)) return total
  // recurse
  if (isSchema(node)) {
    for (let i = 0; i < node.fields.length; i++) {
      const child = node.fields[i]
      const ref = (object as Record<string, unknown>)[node.keys[i]]
      if ((ref as Observed)[$touched]) {
        total = patchInner(op, child, ref as object, total, traverse)
      }
    }
  } else if ("element" in node) {
    const element = node.element as CollatedNode<ByteView>
    switch (node[$kind]) {
      case FieldKind.Array:
        for (let i = 0; i < (object as unknown as object[]).length; i++) {
          const value = (object as unknown as object[])[i]
          if ((value as Observed)[$touched]) {
            total = patchInner(op, element, value, total, [
              ...(traverse ?? []),
              [i, uint16],
            ])
          }
        }
        break
    }
  }
  return total
}

/**
 * Create a patch message op.
 * [entity, schemaId, [field, traverse, [operation, ...args]*]*]
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
  if (!(component as unknown as Observed)[$touched]) return op
  const schemaId = component.__type__
  const root = model[schemaId] as CollatedNode<ByteView>
  insert(op, entity, uint32)
  insert(op, schemaId, uint8)
  modify(op, insert(op, 0, uint8), patchInner(op, root, component))
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
