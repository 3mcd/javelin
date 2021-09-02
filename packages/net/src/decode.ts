import {
  $flat,
  $kind,
  assert,
  CollatedNode,
  FieldKind,
  isPrimitiveField,
  isSchema,
  mutableEmpty,
} from "@javelin/core"
import { $type, Component, Entity, getFieldValue, World } from "@javelin/ecs"
import {
  ByteView,
  Cursor,
  decode as packDecode,
  enhanceModel,
  ModelEnhanced,
  read,
  uint16,
  uint32,
  uint8,
} from "@javelin/pack"
import { MessagePartKind } from "./message"
import { decodeModel, entity } from "./model"

export type DecodeState = {
  world: World
  model: ModelEnhanced
  updatedEntities: Set<Entity>
  localByRemote: Map<Entity, Entity>
}

export function decodeModelPart(
  messageDataView: DataView,
  decodeState: DecodeState,
  cursor: Cursor,
  partEnd: number,
) {
  const model = decodeModel(messageDataView, cursor, partEnd - cursor.offset)
  decodeState.model = enhanceModel(model)
}

function findOrCreateLocal(
  world: World,
  remote: Entity,
  localByRemote: Map<Entity, Entity>,
) {
  let local = localByRemote.get(remote)
  if (local === undefined) {
    local = world.create()
    localByRemote.set(remote, local)
  }
  return local
}

function decodeAttachPart(
  messageDataView: DataView,
  decodeState: DecodeState,
  cursor: Cursor,
  partEnd: number,
) {
  const { world, model, localByRemote } = decodeState
  const { buffer } = messageDataView
  while (cursor.offset < partEnd) {
    const toAttach: Component[] = []
    const remote = read(messageDataView, uint32, cursor)
    const count = read(messageDataView, uint8, cursor)
    const local = findOrCreateLocal(world, remote, localByRemote)
    for (let i = 0; i < count; i++) {
      const schemaId = read(messageDataView, uint8, cursor)
      let component: Component | null = null
      try {
        component = world.storage.getComponentBySchemaId(local, schemaId)
      } catch {}
      if (component === null) {
        const remote = packDecode<Component>(buffer, model[schemaId], cursor)
        remote[$type] = schemaId
        toAttach.push(remote)
      } else {
        packDecode(buffer, model[schemaId], cursor, component)
      }
    }
    if (toAttach.length > 0) {
      world.attachImmediate(local, toAttach)
    }
    decodeState.updatedEntities.add(local)
  }
}

function decodeSnapshotPart(
  messageDataView: DataView,
  decodeState: DecodeState,
  cursor: Cursor,
  partEnd: number,
) {
  const { world, model, localByRemote } = decodeState
  const { buffer } = messageDataView
  while (cursor.offset < partEnd) {
    const remote = read(messageDataView, uint32, cursor)
    const count = read(messageDataView, uint8, cursor)
    const local = findOrCreateLocal(world, remote, localByRemote)
    for (let i = 0; i < count; i++) {
      const schemaId = read(messageDataView, uint8, cursor)
      let component: Component | null = null
      try {
        component = world.storage.getComponentBySchemaId(local, schemaId)
      } catch {}
      packDecode(buffer, model[schemaId], cursor, component ?? undefined)
    }
    decodeState.updatedEntities.add(local)
  }
}

const traverse: (number | string)[] = []

function decodePatchPart(
  dataView: DataView,
  decodeState: DecodeState,
  cursor: Cursor,
  partEnd: number,
) {
  const { world, model, localByRemote, updatedEntities } = decodeState
  while (cursor.offset < partEnd) {
    const remote = read(dataView, uint32, cursor)
    const local = findOrCreateLocal(world, remote, localByRemote)
    const schemaId = read(dataView, uint8, cursor)
    let component: Component | null
    try {
      component = world.storage.getComponentBySchemaId(local, schemaId)
    } catch {
      component = null
    }
    const total = read(dataView, uint8, cursor)
    const flat = model[$flat][schemaId]
    for (let i = 0; i < total; i++) {
      const node = flat[read(dataView, uint8, cursor)]
      const traverseLength = read(dataView, uint8, cursor)
      mutableEmpty(traverse)
      for (let j = 0; j < traverseLength; j++) {
        traverse.push(
          read(dataView, node.traverse[j] as ByteView, cursor) as
            | number
            | string,
        )
      }
      const object = component
        ? (getFieldValue(flat[0], component!, node.id, traverse) as Record<
            string,
            unknown
          >)
        : null
      const size = read(dataView, uint8, cursor)
      if (isSchema(node)) {
        for (let j = 0; j < size; j++) {
          const fieldId = read(dataView, uint8, cursor)
          const field = flat[fieldId]
          const key = node.keysByFieldId[fieldId]
          const value = isPrimitiveField(field)
            ? read(dataView, field, cursor)
            : packDecode(dataView.buffer, field)
          if (object !== null) object[key] = value
        }
      } else {
        assert("element" in node)
        const element = node.element as CollatedNode<ByteView>
        const primitive = isPrimitiveField(element)
        switch (node[$kind]) {
          case FieldKind.Array:
            for (let j = 0; j < size; j++) {
              const index = read(dataView, uint16, cursor)
              const value = primitive
                ? read(dataView, element as ByteView, cursor)
                : packDecode(dataView.buffer, element, cursor)
              if (object !== null) object[index] = value
            }
            break
        }
      }
    }
    updatedEntities.add(local)
  }
}

function decodeDetachPart(
  dataView: DataView,
  decodeState: DecodeState,
  cursor: Cursor,
  partEnd: number,
) {
  const { world, localByRemote } = decodeState
  while (cursor.offset < partEnd) {
    const schemaIds: number[] = []
    const remote = read(dataView, uint32, cursor)
    const local = findOrCreateLocal(world, remote, localByRemote)
    const count = read(dataView, uint8, cursor)
    for (let i = 0; i < count; i++) {
      const schemaId = read(dataView, uint8, cursor)
      schemaIds.push(schemaId)
    }
    world.detachImmediate(local, schemaIds)
  }
}
function decodeDestroyPart(
  dataView: DataView,
  decodeState: DecodeState,
  cursor: Cursor,
  partEnd: number,
) {
  const { world, localByRemote } = decodeState
  while (cursor.offset < partEnd) {
    const remote = read(dataView, uint32, cursor)
    const local = findOrCreateLocal(world, remote, localByRemote)
    world.destroyImmediate(local)
  }
}

export function decode(
  message: ArrayBuffer,
  decodeState: DecodeState,
  cursor: Cursor = { offset: 0 },
) {
  const messageByteLength = message.byteLength
  const messageDataView = new DataView(message)
  while (cursor.offset < messageByteLength) {
    const partKind = read(messageDataView, uint8, cursor)
    const partLength = read(messageDataView, uint32, cursor)
    const partEnd = cursor.offset + partLength
    switch (partKind) {
      case MessagePartKind.Model:
        decodeModelPart(messageDataView, decodeState, cursor, partEnd)
        break
      case MessagePartKind.Attach:
        decodeAttachPart(messageDataView, decodeState, cursor, partEnd)
        break
      case MessagePartKind.Snapshot:
        decodeSnapshotPart(messageDataView, decodeState, cursor, partEnd)
        break
      case MessagePartKind.Patch:
        decodePatchPart(messageDataView, decodeState, cursor, partEnd)
        break
      case MessagePartKind.Detach:
        decodeDetachPart(messageDataView, decodeState, cursor, partEnd)
        break
      case MessagePartKind.Destroy:
        decodeDestroyPart(messageDataView, decodeState, cursor, partEnd)
        break
    }
  }
  return decodeState
}
