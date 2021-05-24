import { $flat, assert, mutableEmpty } from "@javelin/core"
import { Component } from "@javelin/ecs"
import * as Pack from "@javelin/pack"
import { enhanceModel, ModelEnhanced } from "@javelin/pack"
import { MessagePartKind } from "./message"
import { decodeModel } from "./model"

const ERROR_MODEL_NOT_FOUND =
  "Failed to decode network message: model not provided to decode() nor, was it encoded in message"

type EntitySnapshotHandler = (entity: number, components: Component[]) => void

export type DecodeMessageHandlers = {
  onModel?(model: ModelEnhanced): void
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
  cursor: Pack.Cursor,
  length: number,
  model: ModelEnhanced,
  onSnapshot?: EntitySnapshotHandler,
) {
  const end = cursor.offset + length
  const { buffer } = dataView
  while (cursor.offset < end) {
    const components: Component[] = []
    const entity = Pack.read(dataView, Pack.uint32, cursor)
    const count = Pack.read(dataView, Pack.uint8, cursor)
    for (let i = 0; i < count; i++) {
      const schemaId = Pack.read(dataView, Pack.uint8, cursor)
      const component = Pack.decode<Component>(buffer, model[schemaId], cursor)
      ;(component as any).__type__ = schemaId
      components.push(component)
    }
    onSnapshot?.(entity, components)
  }
}

const tmpTraverse: number[] = []

function decodePatch(
  dataView: DataView,
  cursor: Pack.Cursor,
  length: number,
  model: ModelEnhanced,
  onPatch: DecodeMessageHandlers["onPatch"],
) {
  const end = cursor.offset + length
  while (cursor.offset < end) {
    const entity = Pack.read(dataView, Pack.uint32, cursor)
    const size = Pack.read(dataView, Pack.uint8, cursor)
    for (let i = 0; i < size; i++) {
      const schemaId = Pack.read(dataView, Pack.uint8, cursor)
      const collated = model[$flat][schemaId]
      const fieldCount = Pack.read(dataView, Pack.uint8, cursor)
      const arrayCount = Pack.read(dataView, Pack.uint8, cursor)
      for (let j = 0; j < fieldCount; j++) {
        const field = Pack.read(dataView, Pack.uint8, cursor)
        const traverseLength = Pack.read(dataView, Pack.uint8, cursor)
        mutableEmpty(tmpTraverse)
        for (let k = 0; k < traverseLength; k++) {
          tmpTraverse.push(Pack.read(dataView, Pack.uint16, cursor))
        }
        const value = Pack.decode(dataView.buffer, collated[field], cursor)
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
  cursor: Pack.Cursor,
  length: number,
  onDetach: DecodeMessageHandlers["onDetach"],
) {
  const end = cursor.offset + length
  while (cursor.offset < end) {
    const schemaIds = []
    const entity = Pack.read(dataView, Pack.uint32, cursor)
    const schemaIdsLength = Pack.read(dataView, Pack.uint8, cursor)
    for (let i = 0; i < schemaIdsLength; i++) {
      const schemaId = Pack.read(dataView, Pack.uint8, cursor)
      schemaIds.push(schemaId)
    }
    onDetach?.(entity, schemaIds)
  }
}

function decodeDestroy(
  dataView: DataView,
  cursor: Pack.Cursor,
  length: number,
  onDestroy: DecodeMessageHandlers["onDestroy"],
) {
  const end = cursor.offset + length
  while (cursor.offset < end) {
    const entity = Pack.read(dataView, Pack.uint32, cursor)
    onDestroy?.(entity)
  }
}

function _decodeModel(
  dataView: DataView,
  cursor: Pack.Cursor,
  length: number,
  onModel: DecodeMessageHandlers["onModel"],
) {
  onModel?.(enhanceModel(decodeModel(dataView, cursor, length)))
}

export function decode(
  buffer: ArrayBuffer,
  handlers: DecodeMessageHandlers,
  model?: ModelEnhanced,
) {
  const { onPatch, onDetach, onDestroy, onModel } = handlers
  const cursor = { offset: 0 }
  const dataView = new DataView(buffer)
  const _onModel = (_model: ModelEnhanced) => {
    model = _model
    onModel?.(_model)
  }

  while (cursor.offset < dataView.byteLength) {
    const kind = Pack.read(dataView, Pack.uint8, cursor)
    const byteLength = Pack.read(dataView, Pack.uint32, cursor)
    switch (kind) {
      case MessagePartKind.Model:
        _decodeModel(dataView, cursor, byteLength, _onModel)
        break
      case MessagePartKind.Attach:
      case MessagePartKind.Update:
        assert(model !== undefined, ERROR_MODEL_NOT_FOUND)
        decodeEntitySnapshot(
          dataView,
          cursor,
          byteLength,
          model,
          kind === MessagePartKind.Attach
            ? handlers.onAttach
            : handlers.onUpdate,
        )
        break
      case MessagePartKind.Patch:
        assert(model !== undefined, ERROR_MODEL_NOT_FOUND)
        decodePatch(dataView, cursor, byteLength, model, onPatch)
        break
      case MessagePartKind.Detach:
        decodeDetach(dataView, cursor, byteLength, onDetach)
        break
      case MessagePartKind.Destroy:
        decodeDestroy(dataView, cursor, byteLength, onDestroy)
        break
    }
  }
}
