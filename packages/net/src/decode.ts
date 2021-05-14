import {
  $flat,
  assert,
  ErrorType,
  Model,
  mutableEmpty,
  SchemaKeyKind,
} from "@javelin/core"
import { Component } from "@javelin/ecs"
import {
  dataTypeToView,
  decode as decodePack,
  uint16,
  uint32,
  uint8,
} from "@javelin/pack"
import { MessagePartKind } from "./message"
import { decodeModel } from "./model"

const ERROR_MODEL_NOT_FOUND =
  "Failed to decode network message: model not provided to decode() nor, was it encoded in message"

type EntitySnapshotHandler = (entity: number, components: Component[]) => void

export type DecodeMessageHandlers = {
  onTick?(tick: number): void
  onModel?(model: Model): void
  onSpawn?: EntitySnapshotHandler
  onAttach?: EntitySnapshotHandler
  onUpdate?: EntitySnapshotHandler
  onDetach?(entity: number, schemaIds: number[]): void
  onDestroy?(entity: number): void
  onPatch?(
    entity: number,
    schemaId: number,
    field: number,
    traverse: number[],
    value: unknown,
  ): void
  onArrayMethod?(
    entity: number,
    schemaId: number,
    method: number,
    field: number,
    traverse: number,
    index?: number,
    remove?: number,
    values?: unknown[],
  ): void
}

function decodeEntitySnapshot(
  dataView: DataView,
  offset: number,
  length: number,
  model: Model,
  onSnapshot: EntitySnapshotHandler,
) {
  const end = offset + length
  const { buffer } = dataView
  while (offset < end) {
    const components: Component[] = []
    const ent = uint32.read(dataView, offset)
    offset += uint32.byteLength
    const cnt = uint8.read(dataView, offset)
    offset += uint8.byteLength
    for (let i = 0; i < cnt; i++) {
      const cid = uint8.read(dataView, offset)
      offset += uint8.byteLength
      const len = uint16.read(dataView, offset)
      offset += uint16.byteLength
      const enc = buffer.slice(offset, offset + len)
      offset += len
      const component = decodePack<Component>(enc, model[cid])
      ;(component as any).__type__ = cid
      components.push(component)
    }
    onSnapshot(ent, components)
  }
}

const tmpTraverse: number[] = []

function decodePatch(
  dataView: DataView,
  offset: number,
  length: number,
  model: Model,
  onPatch: DecodeMessageHandlers["onPatch"],
) {
  const end = offset + length
  while (offset < end) {
    const entity = uint32.read(dataView, offset)
    offset += uint32.byteLength
    const count = uint8.read(dataView, offset)
    offset += uint8.byteLength
    for (let i = 0; i < count; i++) {
      const schemaId = uint8.read(dataView, offset)
      const componentSchema = model[$flat][schemaId]
      offset += uint8.byteLength
      const fieldCount = uint8.read(dataView, offset)
      offset += uint8.byteLength
      const arrayCount = uint8.read(dataView, offset)
      offset += uint8.byteLength
      for (let j = 0; j < fieldCount; j++) {
        const field = uint8.read(dataView, offset)
        offset += uint8.byteLength
        const traverseLength = uint8.read(dataView, offset)
        offset += uint8.byteLength
        mutableEmpty(tmpTraverse)
        for (let k = 0; k < traverseLength; k++) {
          tmpTraverse.push(uint16.read(dataView, offset))
          offset += uint16.byteLength
        }
        const node = componentSchema[field]
        assert(
          node.kind === SchemaKeyKind.Primitive,
          "Failed to decode patch: only primitive field mutations are currently supported",
        )
        const view = dataTypeToView(node.type)
        const value = view.read(dataView, offset)
        offset += view.byteLength
        onPatch?.(entity, schemaId, field, tmpTraverse, value)
      }
      for (let j = 0; j < arrayCount; j++) {
        // TODO: support mutating array methods
      }
    }
  }
}

function decodeDetach(
  dataView: DataView,
  offset: number,
  length: number,
  onDetach: DecodeMessageHandlers["onDetach"],
) {
  const end = offset + length
  while (offset < end) {
    const schemaIds = []
    const entity = uint32.read(dataView, offset, 0)
    offset += uint32.byteLength
    const schemaIdsLength = uint8.read(dataView, offset, 0)
    offset += uint8.byteLength
    for (let i = 0; i < schemaIdsLength; i++) {
      const schemaId = uint8.read(dataView, offset, 0)
      offset += uint8.byteLength
      schemaIds.push(schemaId)
    }
    onDetach?.(entity, schemaIds)
  }
}

function decodeDestroy(
  dataView: DataView,
  offset: number,
  length: number,
  onDestroy: DecodeMessageHandlers["onDestroy"],
) {
  const end = offset + length
  while (offset < end) {
    const entity = uint32.read(dataView, offset, 0)
    offset += uint32.byteLength
    onDestroy?.(entity)
  }
}

function decodeTick(
  dataView: DataView,
  offset: number,
  length: number,
  onTick: DecodeMessageHandlers["onTick"],
) {
  const end = offset + length
  while (offset < end) {
    const tick = uint32.read(dataView, offset, 0)
    offset += uint32.byteLength
    onTick?.(tick)
  }
  return offset
}

function _decodeModel(
  dataView: DataView,
  offset: number,
  length: number,
  onModel: DecodeMessageHandlers["onModel"],
) {
  onModel?.(decodeModel(dataView, offset, length))
}

function getHandlerByMessagePartKind(
  handlers: DecodeMessageHandlers,
  kind: MessagePartKind,
) {
  let handler: EntitySnapshotHandler | undefined
  switch (kind) {
    case MessagePartKind.Spawn:
      handler = handlers.onSpawn
    case MessagePartKind.Spawn:
      handler = handlers.onSpawn
    case MessagePartKind.Spawn:
      handler = handlers.onSpawn
  }
  assert(handler !== undefined, "", ErrorType.Internal)
  return handler
}

export function decode(
  buffer: ArrayBuffer,
  handlers: DecodeMessageHandlers,
  model?: Model,
) {
  const { onPatch, onDetach, onDestroy, onTick, onModel } = handlers
  const dataView = new DataView(buffer)
  const _onModel = (_model: Model) => {
    model = _model
    onModel?.(_model)
  }

  let offset = 0
  while (offset < dataView.byteLength) {
    const kind = uint8.read(dataView, offset)
    offset += uint8.byteLength
    const length = uint16.read(dataView, offset)
    offset += uint16.byteLength
    switch (kind) {
      case MessagePartKind.Model:
        _decodeModel(dataView, offset, length, _onModel)
        break
      case MessagePartKind.Tick:
        decodeTick(dataView, offset, length, onTick)
        break
      case MessagePartKind.Spawn:
      case MessagePartKind.Attach:
      case MessagePartKind.Update:
        assert(model !== undefined, ERROR_MODEL_NOT_FOUND)
        decodeEntitySnapshot(
          dataView,
          offset,
          length,
          model,
          getHandlerByMessagePartKind(handlers, kind),
        )
        break
      case MessagePartKind.Patch:
        assert(model !== undefined, ERROR_MODEL_NOT_FOUND)
        decodePatch(dataView, offset, length, model, onPatch)
        break
      case MessagePartKind.Detach:
        decodeDetach(dataView, offset, length, onDetach)
        break
      case MessagePartKind.Destroy:
        decodeDestroy(dataView, offset, length, onDestroy)
        break
    }
    offset += length
  }
}
