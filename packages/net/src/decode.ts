import { Component } from "@javelin/ecs"
import { Model } from "@javelin/model"
import { uint16, uint8 } from "@javelin/pack"
import { MessagePartKind } from "./message"

export type DecodeMessageHandlers = {
  onTick(tick: number): void
  onModel(model: Model): void
  onSpawn(entity: number, components: Component[]): void
  onAttach(entity: number, components: Component[]): void
  onUpdate(entity: number, components: Component[]): void
  onDetach(entity: number, componentTypeIds: number[]): void
  onDestroy(entity: number): void
  onPatch(dataView: DataView, model: Model, offset: number): void
}

function decodeSpawn(
  dataView: DataView,
  offset: number,
  length: number,
  onSpawn: DecodeMessageHandlers["onSpawn"],
): number {
  return offset
}

export function decode(buffer: ArrayBuffer, handlers: DecodeMessageHandlers) {
  const dataView = new DataView(buffer)

  let offset = 0
  while (offset < dataView.byteLength) {
    const kind = uint8.read(dataView, offset)
    offset += uint8.byteLength
    const length = uint16.read(dataView, offset)
    switch (kind) {
      case MessagePartKind.Spawn:
        offset = decodeSpawn(dataView, offset, length, handlers.onSpawn)
        break
    }
  }
}
