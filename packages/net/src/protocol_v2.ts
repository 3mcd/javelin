import {
  attached,
  Component,
  ComponentType,
  SerializedComponentType,
} from "@javelin/ecs"
import {
  decode,
  encode,
  int32,
  Schema,
  uint16,
  uint32,
  uint8,
  View,
} from "@javelin/pack"
import { Model } from "./protocol"

export interface NetProtocol {
  updateModel(model: SerializedComponentType[]): void
}

type ComponentTypeSchemaMap = { [componentTypeId: number]: Schema }

// Javelin has three message types, each sent to clients by an authoritative server:
//   Model
//   State
//   StateUnreliable

// Model is the first message sent by a MessageProducer to a remote client.
// This message informs the client of the server-side ComponentType schema so
// the client is able to decode components in State and StateUnreliable
// messages.

// State is where the magic happens. This message contains all state changes
// that each client should be informed of. Unless you implement acknowledgement
// and retries yourself, State should be sent reliably since it contains newly
// added/removed resources that will not be sent again.
//
// A single State message consists of several parts:
//   (T) current server tick
//   (S) spawned entities and their components
//   (A) attached components
//   (D) detached components
//   (X) destroyed entities
//
// The message layout looks like:
//   [T, S[], A[], D[], X[]]

// StateUnreliable is a slimmed down version of State which does not include
// added/removed resources, only component changes.

// function buildComponentTypeSchemaMapFromModel(
//   model: SerializedComponentType[],
// ): ComponentTypeSchemaMap {
//   return model.reduce(() => {}, {})
// }

type Attach = (number | ArrayBuffer)[]
type Detach = number[]
type Destroy = number[]

export class MessagePart<
  P extends unknown[],
  V extends P extends Array<infer _> ? _ : never = P extends Array<infer _>
    ? _
    : never
> {
  protected data = ([] as unknown) as P
  protected views: View<V>[] = []
  protected _byteLength = uint32.byteLength

  get byteLength() {
    return this._byteLength
  }

  insert(data: V | ArrayBuffer, view?: View<V>): void {
    const index = this.data.push(data) - 1

    if (view === undefined) {
      this._byteLength += (data as ArrayBuffer).byteLength
    } else {
      this._byteLength += view.byteLength
      this.views[index] = view
    }
  }

  write(buffer: ArrayBuffer, bufferView: DataView, offset: number) {
    int32.write(bufferView, offset, this._byteLength)
    offset += int32.byteLength

    for (let i = 0; i < this.data.length; i++) {
      const data = this.data[i]
      const view = this.views[i]

      if (data instanceof ArrayBuffer) {
        new Uint8Array(buffer, 0, buffer.byteLength).set(
          new Uint8Array(data),
          offset,
        )
        offset += data.byteLength
      } else {
        view.write(bufferView, offset, data as V)
        offset += view.byteLength
      }
    }

    return offset
  }
}

export class MessageBuilder {
  private tick = 0
  private parts = [
    new MessagePart<Attach>(),
    new MessagePart<Attach>(),
    new MessagePart<Detach>(),
    new MessagePart<Destroy>(),
  ] as const

  constructor(private model: Map<number, Schema>) {}

  private encodeComponent(component: Component): ArrayBuffer {
    const componentSchema = this.model.get(component._tid)

    if (!componentSchema) {
      throw new Error("Failed to encode component: type not found in model")
    }

    return encode(component as any, componentSchema)
  }

  private attach(entity: number, components: Component[], create = false) {
    const target = this.parts[create ? 0 : 1]
    // entity
    target.insert(entity, uint32)
    // component length
    target.insert(components.length, uint8)

    for (let i = 0; i < components.length; i++) {
      const componentEncoded = this.encodeComponent(components[i])
      // component type id
      target.insert(components[i]._tid, uint8)
      // encoded component length
      target.insert(componentEncoded.byteLength, uint16)
      // encoded component
      target.insert(componentEncoded)
    }
  }

  setTick(tick: number) {
    this.tick = tick
  }

  insertCreated(entity: number, components: Component[]) {
    this.attach(entity, components, true)
  }

  insertAttached(entity: number, components: Component[]) {
    this.attach(entity, components)
  }

  insertDetached(entity: number, componentTypeIds: number[]) {
    const [, , detach] = this.parts
    detach.insert(entity, uint32)
    detach.insert(componentTypeIds.length, uint8)
    for (let i = 0; i < componentTypeIds.length; i++) {
      detach.insert(componentTypeIds[i], uint8)
    }
  }

  insertDestroyed(entity: number) {
    const [, , , destroy] = this.parts
    destroy.insert(entity, uint32)
  }

  encode() {
    const byteLength =
      // tick
      uint32.byteLength +
      // message parts
      this.parts.reduce((a, part) => a + part.byteLength, 0)

    const buffer = new ArrayBuffer(byteLength)
    const bufferView = new DataView(buffer)

    bufferView.setUint32(0, this.tick)

    this.parts.reduce(
      (offset, part) => part.write(buffer, bufferView, offset),
      uint32.byteLength,
    )

    return buffer
  }
}

function decodeAttach(
  buffer: ArrayBuffer,
  bufferView: DataView,
  model: Map<number, Schema>,
  offset: number,
  onAttach: (entity: number, components: Component[]) => void,
) {
  const attachLength = uint32.read(bufferView, offset, 0)
  const attachEnd = offset + attachLength

  offset += uint32.byteLength

  while (offset < attachEnd) {
    const components: Component[] = []
    const entity = uint32.read(bufferView, offset, 0)
    offset += uint32.byteLength
    const componentLength = uint8.read(bufferView, offset, 0)
    offset += uint8.byteLength

    for (let i = 0; i < componentLength; i++) {
      const componentTypeId = uint8.read(bufferView, offset, 0)
      offset += uint8.byteLength
      const encodedComponentLength = uint16.read(bufferView, offset, 0)
      offset += uint16.byteLength
      const encodedComponent = buffer.slice(
        offset,
        offset + encodedComponentLength,
      )
      offset += encodedComponentLength
      const component = decode(encodedComponent, model.get(componentTypeId)!)
      component._tid = componentTypeId
      components.push(component)
    }

    onAttach(entity, components)
  }

  return offset
}

function decodeDetach(
  bufferView: DataView,
  offset: number,
  onDetach: (entity: number, componentTypeIds: number[]) => void,
) {
  const detachLength = uint32.read(bufferView, offset, 0)
  const detachEnd = offset + detachLength

  offset += uint32.byteLength

  while (offset < detachEnd) {
    const componentTypeIds = []
    const entity = uint32.read(bufferView, offset, 0)
    offset += uint32.byteLength
    const componentTypeIdsLength = uint8.read(bufferView, offset, 0)
    offset += uint8.byteLength

    for (let i = 0; i < componentTypeIdsLength; i++) {
      const componentTypeId = uint8.read(bufferView, offset, 0)
      offset += uint8.byteLength
      componentTypeIds.push(componentTypeId)
    }

    onDetach(entity, componentTypeIds)
  }

  return offset
}

function decodeDestroy(
  bufferView: DataView,
  offset: number,
  onDestroy: (entity: number) => void,
) {
  const destroyLength = uint32.read(bufferView, offset, 0)
  const destroyEnd = offset + destroyLength

  offset += uint32.byteLength

  while (offset < destroyEnd) {
    const entity = uint32.read(bufferView, offset, 0)
    offset += uint32.byteLength
    onDestroy(entity)
  }

  return offset
}

export function decodeMessage(
  buffer: ArrayBuffer,
  model: Map<number, Schema>,
  onTick: (tick: number) => void,
  onCreate: (entity: number, components: Component[]) => void,
  onAttach: (entity: number, components: Component[]) => void,
  onDetach: (entity: number, componentTypeIds: number[]) => void,
  onDestroy: (entity: number) => void,
) {
  const bufferView = new DataView(buffer)
  const tick = uint32.read(bufferView, 0, 0)

  let offset = uint32.byteLength

  onTick(tick)

  offset = decodeAttach(buffer, bufferView, model, offset, onCreate)
  offset = decodeAttach(buffer, bufferView, model, offset, onAttach)
  offset = decodeDetach(bufferView, offset, onDetach)
  offset = decodeDestroy(bufferView, offset, onDestroy)
}

export function createNetProtocol(): NetProtocol {
  let schema: ComponentTypeSchemaMap = {}

  function updateModel(model: SerializedComponentType[]) {
    // schema = buildComponentTypeSchemaMapFromModel(model)
  }

  return {
    updateModel,
  }
}
