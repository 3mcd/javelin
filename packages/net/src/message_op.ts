import {
  Component,
  Entity,
  UNSAFE_internals,
  UNSAFE_modelChanged,
} from "@javelin/ecs"
import {
  assert,
  createStackPool,
  flattenModel,
  InstanceOfSchema,
  Model,
  ModelFlat,
  ModelNodeKind,
  mutableEmpty,
} from "@javelin/model"
import {
  dataTypeToView,
  encode,
  uint16,
  uint32,
  uint8,
  View,
} from "@javelin/pack"
import { ChangeSet } from "@javelin/track"

export const $buffer = Symbol("javelin_array_buffer")

export type MessageOp = {
  data: unknown[]
  view: (View | typeof $buffer)[]
  byteLength: number
}

function createOp(): MessageOp {
  return {
    data: [],
    view: [],
    byteLength: 0,
  }
}

function resetOp(op: MessageOp): MessageOp {
  mutableEmpty(op.data)
  mutableEmpty(op.view)
  op.byteLength = 0
  return op
}

export const messageOpPool = createStackPool(createOp, resetOp, 1000)

let _model: Model
let _modelFlat: ModelFlat

function updateModel(model: Model) {
  _model = model
  _modelFlat = flattenModel(model)
}

UNSAFE_modelChanged.subscribe(updateModel)
updateModel(UNSAFE_internals.__MODEL__)

function insert(op: MessageOp, data: ArrayBuffer): MessageOp
function insert(op: MessageOp, data: unknown, view: View): MessageOp
function insert(op: MessageOp, data: unknown, view?: View) {
  op.data.push(data)
  op.view.push(view ?? $buffer)
  op.byteLength += view ? view.byteLength : (data as ArrayBuffer).byteLength
  return op
}

/**
 * [ent: uint32, cnt: uint8, (cid: uint8, len: uint16, enc: *)]
 * @param entity
 * @param components
 */
export function spawn(entity: Entity, components: Component[]): MessageOp {
  const op = messageOpPool.retain()
  const length = components.length
  insert(op, entity, uint32)
  insert(op, length, uint8)
  for (let i = 0; i < length; i++) {
    const component = components[i]
    const componentTypeId = component.__type__
    const componentEncoded = encode(component, _model[componentTypeId])
    insert(op, componentTypeId, uint8)
    insert(op, componentEncoded.byteLength, uint16)
    insert(op, componentEncoded)
  }
  return op
}

export const attach = spawn
export const update = spawn

export function patch(
  entity: Entity,
  changeset: InstanceOfSchema<typeof ChangeSet>,
): MessageOp {
  const op = messageOpPool.retain()
  const length = changeset.length
  insert(op, entity, uint32)
  insert(op, length, uint8)
  for (const prop in changeset.changes) {
    const componentTypeId = +prop
    const componentSchema = _modelFlat[componentTypeId]
    const changes = changeset.changes[prop]
    insert(op, componentTypeId, uint8)
    insert(op, changes.fieldCount, uint8)
    insert(op, changes.arrayCount, uint8)
    for (const prop in changes.fields) {
      const { noop, record, value } = changes.fields[prop]
      const node = componentSchema[record.field]
      assert(
        node.kind === ModelNodeKind.Primitive,
        "Failed to encode patch: only primitive field mutations are currently supported",
      )
      if (noop) {
        continue
      }
      insert(op, record.field, uint8)
      insert(op, record.traverse.length, uint8)
      for (let i = 0; i < record.traverse.length; i++) {
        insert(op, record.traverse[i], uint16)
      }
      insert(op, value, dataTypeToView(node.type))
    }
  }
  return op
}

export function detach(entity: Entity, componentTypeIds: number[]): MessageOp {
  const op = messageOpPool.retain()
  const length = componentTypeIds.length
  insert(op, entity, uint32)
  insert(op, length, uint8)
  for (let i = 0; i < length; i++) {
    insert(op, componentTypeIds[i], uint8)
  }
  return op
}

export function destroy(entity: Entity): MessageOp {
  const op = messageOpPool.retain()
  insert(op, entity, uint32)
  return op
}
