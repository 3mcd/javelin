import { Component, mutableEmpty, SerializedComponentType } from "@javelin/ecs"
import { Entity } from "@javelin/ecs/dist/cjs/entity"
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

export interface NetProtocol {
  updateModel(model: Model): void
}

type Model = SerializedComponentType[]
type ComponentTypeSchemaMap = { [componentTypeId: number]: Schema }

// A single State message consists of several parts:
//   (T) current server tick
//   (M) model
//   (S) spawned entities and their components
//   (A) attached components
//   (U) updated components
//   (D) detached components
//   (X) destroyed entities
//
// The message layout looks like:
//   [T, M, S[], A[], U[], D[], X[]]

function buildComponentTypeSchemaMapFromModel(
  model: Model,
): ComponentTypeSchemaMap {
  return model.reduce((a, serializedComponentType) => {
    return a
  }, {} as ComponentTypeSchemaMap)
}

type EntityComponentsPair = (number | ArrayBuffer)[]
type Detach = number[]
type Destroy = number[]

/**
 * MessagePart encodes a repeating part of a message. It exposes methods for
 * inserting values and writing them to an ArrayBuffer at a specific offset.
 * It accumulates the total byte length of the part as data is inserted, and
 * prepends the final length as a 32-bit integer at the start of the message
 * frame.
 */
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

  insert(data: V, view: View<V>): void {
    this.views[this.data.push(data) - 1] = view
    this._byteLength += view.byteLength
  }

  insertBuffer(data: ArrayBuffer) {
    this.data.push(data)
    this._byteLength += data.byteLength
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

  reset() {
    this._byteLength = uint32.byteLength
    mutableEmpty(this.views)
    mutableEmpty(this.data)
  }
}

export class MessageBuilder {
  private tick = 0
  private parts = [
    new MessagePart<Model>(),
    new MessagePart<EntityComponentsPair>(), // spawn
    new MessagePart<EntityComponentsPair>(), // attach
    new MessagePart<EntityComponentsPair>(), // update
    new MessagePart<Detach>(),
    new MessagePart<Destroy>(),
  ] as const

  constructor(private schemas: Map<number, Schema>) {}

  private encodeComponent(component: Component): ArrayBuffer {
    const componentSchema = this.schemas.get(component._tid)

    if (!componentSchema) {
      throw new Error("Failed to encode component: type not found in model")
    }

    return encode(component as any, componentSchema)
  }

  private _attach(
    entity: Entity,
    components: Component[],
    target: MessagePart<EntityComponentsPair>,
  ) {
    // entity
    target.insert(entity, uint32)
    // component length
    target.insert(components.length, uint8)

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const componentEncoded = this.encodeComponent(component)
      // component type id
      target.insert(component._tid, uint8)
      // encoded component length
      target.insert(componentEncoded.byteLength, uint16)
      // encoded component
      target.insertBuffer(componentEncoded)
    }
  }

  setTick(tick: number) {
    this.tick = tick
  }

  model(model: Model) {
    // this.parts[0].insert()
  }

  spawn(entity: Entity, components: Component[]) {
    this._attach(entity, components, this.parts[1])
  }

  attach(entity: Entity, components: Component[]) {
    this._attach(entity, components, this.parts[2])
  }

  update(entity: Entity, components: Component[]) {
    this._attach(entity, components, this.parts[3])
  }

  detach(entity: Entity, componentTypeIds: number[]) {
    const detach = this.parts[4]
    detach.insert(entity, uint32)
    detach.insert(componentTypeIds.length, uint8)
    for (let i = 0; i < componentTypeIds.length; i++) {
      detach.insert(componentTypeIds[i], uint8)
    }
  }

  destroy(entity: Entity) {
    const destroy = this.parts[5]
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

  reset() {
    this.tick = 0
    for (let i = 0; i < this.parts.length; i++) {
      this.parts[i].reset()
    }
  }
}

function decodeModel(
  buffer: ArrayBuffer,
  bufferView: DataView,
  offset: number,
  onModel: (model: Model) => void,
) {
  const modelLength = uint32.read(bufferView, offset, 0)
  const modelEnd = offset + modelLength

  offset += uint32.byteLength

  return offset
}

function decodeAttach(
  buffer: ArrayBuffer,
  bufferView: DataView,
  model: Map<number, Schema>,
  offset: number,
  onAttach: (entity: Entity, components: Component[]) => void,
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
  onDetach: (entity: Entity, componentTypeIds: number[]) => void,
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
  onDestroy: (entity: Entity) => void,
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

type DecodeMessageHandlers = {
  onTick: (tick: number) => void
  onModel: (model: Model) => void
  onCreate: (entity: Entity, components: Component[]) => void
  onAttach: (entity: Entity, components: Component[]) => void
  onUpdate: (entity: Entity, components: Component[]) => void
  onDetach: (entity: Entity, componentTypeIds: number[]) => void
  onDestroy: (entity: Entity) => void
}

export function decodeMessage(
  buffer: ArrayBuffer,
  schemas: Map<number, Schema>,
  handlers: DecodeMessageHandlers,
) {
  const {
    onTick,
    onModel,
    onCreate,
    onAttach,
    onUpdate,
    onDetach,
    onDestroy,
  } = handlers
  const bufferView = new DataView(buffer)
  const tick = uint32.read(bufferView, 0, 0)

  let offset = uint32.byteLength

  onTick(tick)

  offset = decodeModel(buffer, bufferView, offset, onModel)
  offset = decodeAttach(buffer, bufferView, schemas, offset, onCreate)
  offset = decodeAttach(buffer, bufferView, schemas, offset, onAttach)
  offset = decodeAttach(buffer, bufferView, schemas, offset, onUpdate)
  offset = decodeDetach(bufferView, offset, onDetach)
  offset = decodeDestroy(bufferView, offset, onDestroy)
}

export function createNetProtocol(): NetProtocol {
  let schema: ComponentTypeSchemaMap = {}

  function updateModel(model: Model) {
    schema = buildComponentTypeSchemaMapFromModel(model)
  }

  return {
    updateModel,
  }
}
