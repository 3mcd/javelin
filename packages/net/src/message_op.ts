import {
  $flat,
  assert,
  createStackPool,
  InstanceOfSchema,
  Model,
  mutableEmpty,
  SchemaKeyKind,
} from "@javelin/core"
import { Component, Entity } from "@javelin/ecs"
import {
  dataTypeToView,
  encode,
  uint16,
  uint32,
  uint8,
  View,
} from "@javelin/pack"
import { ChangeSet } from "@javelin/track"
import { encodeModel } from "./model"

export const $buffer = Symbol("javelin_array_buffer")

export type MessageOp = {
  data: unknown[]
  view: (View | typeof $buffer)[]
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

export function insert(op: MessageOp, data: ArrayBuffer): MessageOp
export function insert(op: MessageOp, data: unknown, view: View): MessageOp
export function insert(op: MessageOp, data: unknown, view?: View) {
  op.data.push(data)
  op.view.push(view ?? $buffer)
  op.byteLength += view ? view.byteLength : (data as ArrayBuffer).byteLength
  return op
}

/**

 * Create a snapshot message op.
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
export function snapshot(
  model: Model,
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
    insert(op, encoded.byteLength, uint16)
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

/**
 * Create a patch message op.
 * @example
 * [
 *   entity: uint32,
 *   count: uint8,
 *   changes: [
 *     schemaId: uint8,
 *     fieldCount: uint8,
 *     arrayCount: uint8,
 *     fields: [field: uint8, traverseLength: uint8, (key: uint16), value: *][],
 *     array: [][],
 *   ][],
 * ]
 * @param model
 * @param entity
 * @param changeset
 * @returns MessageOp
 */
export function patch(
  model: Model,
  entity: Entity,
  changeset: InstanceOfSchema<typeof ChangeSet>,
): MessageOp {
  const op = messageOpPool.retain()
  insert(op, entity, uint32)
  insert(op, changeset.size, uint8)
  for (const prop in changeset.changes) {
    const schemaId = +prop
    const schema = model[$flat][schemaId]
    const changes = changeset.changes[prop]
    insert(op, schemaId, uint8)
    insert(op, changes.fieldCount, uint8)
    insert(op, changes.arrayCount, uint8)
    for (const prop in changes.fields) {
      const { noop, record, value } = changes.fields[prop]
      if (noop) {
        continue
      }
      const node = schema[record.field]
      insert(op, record.field, uint8)
      insert(op, record.traverse.length, uint8)
      for (let i = 0; i < record.traverse.length; i++) {
        insert(op, record.traverse[i], uint16)
      }
      if (node.kind === SchemaKeyKind.Primitive) {
        insert(op, value, dataTypeToView(node.type))
      } else {
        const encoded = encode(value, node)
        insert(op, encoded.byteLength, uint16)
        insert(op, encoded)
      }
    }
  }
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
export function model(model: Model): MessageOp {
  const op = messageOpPool.retain()
  insert(op, encodeModel(model))
  return op
}
