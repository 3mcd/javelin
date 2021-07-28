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
import {
  $type,
  Component,
  createEffect,
  Entity,
  getFieldValue,
  ComponentMetadata,
  World,
} from "@javelin/ecs"
import * as Pack from "@javelin/pack"
import { Cursor } from "@javelin/pack"
import { MessagePartKind } from "./message"
import { decodeModel } from "./model"

export const createMessageHandler = (world: World) => {
  let model: Pack.ModelEnhanced
  const state = { updated: new Set<number>() }
  const cursor = { offset: 0 }
  const entities = new Map<number, number>()
  const traverse: (number | string)[] = []
  const messages: ArrayBuffer[] = []
  function decodeModelPart(dataView: DataView, end: number, cursor: Cursor) {
    model = Pack.enhanceModel(
      decodeModel(dataView, cursor, end - cursor.offset),
    )
  }
  function findOrCreateLocalEntity(entityRemote: Entity) {
    let entityLocal = entities.get(entityRemote)
    if (entityLocal === undefined) {
      entityLocal = world.create()
      entities.set(entityRemote, entityLocal)
    }
    return entityLocal
  }
  function decodeAttachPart(dataView: DataView, end: number, cursor: Cursor) {
    const { buffer } = dataView
    while (cursor.offset < end) {
      const toAttach: Component[] = []
      const entityRemote = Pack.read(dataView, Pack.uint32, cursor)
      const entityLocal = findOrCreateLocalEntity(entityRemote)
      const count = Pack.read(dataView, Pack.uint8, cursor)
      for (let i = 0; i < count; i++) {
        const schemaId = Pack.read(dataView, Pack.uint8, cursor)
        let local: Component | null = null
        try {
          local = world.storage.getComponentBySchemaId(entityLocal, schemaId)
        } catch {}
        if (local === null) {
          const remote = Pack.decode<Component>(buffer, model[schemaId], cursor)
          ;(remote as ComponentMetadata)[$type] = schemaId
          toAttach.push(remote)
        } else {
          Pack.decode(buffer, model[schemaId], cursor, local)
        }
      }
      if (toAttach.length > 0) {
        world.attachImmediate(entityLocal, toAttach)
      }
      state.updated.add(entityLocal)
    }
  }
  function decodeSnapshotPart(dataView: DataView, end: number, cursor: Cursor) {
    const { buffer } = dataView
    while (cursor.offset < end) {
      const entityRemote = Pack.read(dataView, Pack.uint32, cursor)
      const entityLocal = findOrCreateLocalEntity(entityRemote)
      const count = Pack.read(dataView, Pack.uint8, cursor)
      for (let i = 0; i < count; i++) {
        const schemaId = Pack.read(dataView, Pack.uint8, cursor)
        let component: Component | null = null
        try {
          component = world.storage.getComponentBySchemaId(
            entityLocal,
            schemaId,
          )
        } catch {}
        Pack.decode(buffer, model[schemaId], cursor, component ?? undefined)
      }
      state.updated.add(entityLocal)
    }
  }
  function decodePatchPart(dataView: DataView, end: number, cursor: Cursor) {
    while (cursor.offset < end) {
      const entityRemote = Pack.read(dataView, Pack.uint32, cursor)
      const entityLocal = findOrCreateLocalEntity(entityRemote)
      const schemaId = Pack.read(dataView, Pack.uint8, cursor)
      let component: Component | null
      try {
        component = world.storage.getComponentBySchemaId(entityLocal, schemaId)
      } catch {
        component = null
      }
      const total = Pack.read(dataView, Pack.uint8, cursor)
      const flat = model[$flat][schemaId]
      for (let i = 0; i < total; i++) {
        const node = flat[Pack.read(dataView, Pack.uint8, cursor)]
        const traverseLength = Pack.read(dataView, Pack.uint8, cursor)
        mutableEmpty(traverse)
        for (let j = 0; j < traverseLength; j++) {
          traverse.push(
            Pack.read(dataView, node.traverse[j] as Pack.ByteView, cursor) as
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
        const size = Pack.read(dataView, Pack.uint8, cursor)
        if (isSchema(node)) {
          for (let j = 0; j < size; j++) {
            const fieldId = Pack.read(dataView, Pack.uint8, cursor)
            const field = flat[fieldId]
            const key = node.keysByFieldId[fieldId]
            const value = isPrimitiveField(field)
              ? Pack.read(dataView, field, cursor)
              : Pack.decode(dataView.buffer, field)
            if (object !== null) object[key] = value
          }
        } else {
          assert("element" in node)
          const element = node.element as CollatedNode<Pack.ByteView>
          const primitive = isPrimitiveField(element)
          switch (node[$kind]) {
            case FieldKind.Array:
              for (let j = 0; j < size; j++) {
                const index = Pack.read(dataView, Pack.uint16, cursor)
                const value = primitive
                  ? Pack.read(dataView, element as Pack.ByteView, cursor)
                  : Pack.decode(dataView.buffer, element, cursor)
                if (object !== null) object[index] = value
              }
              break
          }
        }
      }
      state.updated.add(entityLocal)
    }
  }
  function decodeDetachPart(dataView: DataView, end: number, cursor: Cursor) {
    while (cursor.offset < end) {
      const schemaIds: number[] = []
      const entityRemote = Pack.read(dataView, Pack.uint32, cursor)
      const entityLocal = findOrCreateLocalEntity(entityRemote)
      const count = Pack.read(dataView, Pack.uint8, cursor)
      for (let i = 0; i < count; i++) {
        const schemaId = Pack.read(dataView, Pack.uint8, cursor)
        schemaIds.push(schemaId)
      }
      world.detachImmediate(entityLocal, schemaIds)
    }
  }
  function decodeDestroyPart(dataView: DataView, end: number, cursor: Cursor) {
    while (cursor.offset < end) {
      const entityRemote = Pack.read(dataView, Pack.uint32, cursor)
      const entityLocal = findOrCreateLocalEntity(entityRemote)
      world.destroyImmediate(entityLocal)
    }
  }
  function decode(message: ArrayBuffer) {
    cursor.offset = 0
    const messageLength = message.byteLength
    const dataView = new DataView(message)
    while (cursor.offset < messageLength) {
      const partKind = Pack.read(dataView, Pack.uint8, cursor)
      const partLength = Pack.read(dataView, Pack.uint32, cursor)
      const partEnd = cursor.offset + partLength
      switch (partKind) {
        case MessagePartKind.Model:
          decodeModelPart(dataView, partEnd, cursor)
          break
        case MessagePartKind.Attach:
          decodeAttachPart(dataView, partEnd, cursor)
          break
        case MessagePartKind.Snapshot:
          decodeSnapshotPart(dataView, partEnd, cursor)
          break
        case MessagePartKind.Patch:
          decodePatchPart(dataView, partEnd, cursor)
          break
        case MessagePartKind.Detach:
          decodeDetachPart(dataView, partEnd, cursor)
          break
        case MessagePartKind.Destroy:
          decodeDestroyPart(dataView, partEnd, cursor)
          break
      }
    }
  }
  const push = (message: ArrayBuffer) => messages.unshift(message)
  const system = () => {
    let message: ArrayBuffer | undefined
    state.updated.clear()
    while ((message = messages.pop())) {
      decode(message)
    }
  }
  const useInfo = createEffect(() => () => state, {
    shared: true,
  })

  return {
    push,
    system,
    useInfo,
  }
}
