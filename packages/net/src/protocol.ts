import {
  Component,
  Entity,
  ObserverChangeSet,
  NO_OP,
  MutArrayMethod,
} from "@javelin/ecs"
import {
  assert,
  createModel,
  ErrorType,
  flattenModel,
  Model,
  ModelFlat,
  ModelNodeKind,
  mutableEmpty,
} from "@javelin/model"
import {
  dataTypeToView,
  decode,
  encode,
  uint16,
  uint32,
  uint8,
  View,
} from "@javelin/pack"
import { decodeSchema, encodeModel } from "./model"

type Indices<T extends { length: number }> = Exclude<
  Partial<T>["length"],
  T["length"]
>

type Part = {
  data: unknown[]
  type: (View<unknown> | null)[]
  byteLength: number
}
type PartTick = Part
type PartModel = Part
type PartSpawn = Part
type PartAttach = Part
type PartUpdate = Part
type PartPatch = Part & {
  changesByEntity: Map<Entity, Map<number, ObserverChangeSet>>
}
type PartDetach = Part
type PartDestroy = Part
type Parts = [
  PartTick,
  PartModel,
  PartSpawn,
  PartAttach,
  PartUpdate,
  PartPatch,
  PartDetach,
  PartDestroy,
]

export type Message = {
  parts: Parts
  model: Model
  modelFlat: ModelFlat
}

const createPart = (): Part => {
  return {
    data: [],
    type: [],
    byteLength: 0,
  }
}

const encodePartHeader = (
  bufferView: DataView,
  offset: number,
  byteLength: number,
) => {
  uint16.write(bufferView, offset, byteLength)
  offset += uint16.byteLength
  return offset
}

const encodeChange = (
  buffer: ArrayBuffer,
  bufferView: DataView,
  offset: number,
  message: Message,
  changes: ObserverChangeSet,
  componentTypeId: number,
) => {
  const { object, objectCount, array, arrayCount } = changes
  const type = message.modelFlat[componentTypeId]
  // component id
  uint8.write(bufferView, offset, componentTypeId)
  offset += uint8.byteLength
  // object count
  uint8.write(bufferView, offset, objectCount)
  offset += uint8.byteLength
  // array count
  uint8.write(bufferView, offset, arrayCount)
  offset += uint8.byteLength
  for (const prop in object) {
    const { value, record } = object[prop]
    if (value === NO_OP) {
      continue
    }
    const { field, traverse } = record
    // field
    uint8.write(bufferView, offset, field)
    offset += uint8.byteLength
    // traverse length
    uint8.write(bufferView, offset, traverse?.length ?? 0)
    offset += uint8.byteLength
    // traverse keys
    if (traverse !== undefined) {
      for (let i = 0; i < traverse.length; i++) {
        uint16.write(bufferView, offset, +traverse[i])
        offset += uint16.byteLength
      }
    }
    // value
    const typeField = type[field]
    assert(
      typeField.kind === ModelNodeKind.Primitive,
      "Failed to encode patch: only primitive field mutations are currently supported",
    )
    const view = dataTypeToView(typeField.type)
    view.write(bufferView, offset, value)
    offset += view.byteLength
  }
  for (let i = 0; i < arrayCount; i++) {
    const change = array[i]
    const {
      method,
      record: { field, traverse },
    } = change
    // field
    uint8.write(bufferView, offset, field)
    offset += uint8.byteLength
    // traverse length
    uint8.write(bufferView, offset, traverse?.length ?? 0)
    offset += uint8.byteLength
    // array method
    uint8.write(bufferView, offset, method)
    offset += uint8.byteLength

    if (
      change.method === MutArrayMethod.Pop ||
      change.method === MutArrayMethod.Shift
    ) {
      continue
    }

    const typeField = type[field]
    assert(
      typeField.kind === ModelNodeKind.Primitive,
      "Failed to encode patch: only primitive field mutations are currently supported",
    )
    const view = dataTypeToView(typeField.type)
    const length = change.values.length

    // insert length
    uint8.write(bufferView, offset, length)
    offset += uint8.byteLength

    for (let j = 0; j < length; j++) {
      // insert
      const value = change.values[i]
      view.write(bufferView, offset, value)
      offset += view.byteLength
    }

    if (change.method === MutArrayMethod.Splice) {
      // splice index
      uint8.write(bufferView, offset, change.index)
      offset += uint8.byteLength
      // remove
      uint8.write(bufferView, offset, change.remove)
      offset += uint8.byteLength
    }
  }

  return offset
}

const encodePart = (
  buffer: ArrayBuffer,
  bufferView: DataView,
  offset: number,
  message: Message,
  partsIndex: Indices<Parts>,
) => {
  const part = message.parts[partsIndex]

  offset = encodePartHeader(bufferView, offset, part.byteLength)

  switch (partsIndex) {
    case 5: {
      const patch = message.parts[partsIndex]
      patch.changesByEntity.forEach((changeMap, entity) => {
        // entity
        uint32.write(bufferView, offset, entity)
        offset += uint32.byteLength
        // changes
        changeMap.forEach((changes, componentTypeId) => {
          offset += encodeChange(
            buffer,
            bufferView,
            offset,
            message,
            changes,
            componentTypeId,
          )
        })
      })
      break
    }
    default:
      for (let i = 0; i < part.data.length; i++) {
        const data = part.data[i]
        const type = part.type[i]

        if (data instanceof ArrayBuffer) {
          new Uint8Array(buffer, 0, buffer.byteLength).set(
            new Uint8Array(data),
            offset,
          )
          offset += data.byteLength
        } else {
          assert(type !== null, "", ErrorType.Internal)
          type.write(bufferView, offset, data)
          offset += type.byteLength
        }
      }
      break
  }

  return offset
}

const insert = (part: Part, data: any, type: View<unknown>) => {
  part.data.push(data)
  part.type.push(type)
  part.byteLength += type.byteLength
}

const insertEntityComponents = (
  part: Part,
  entity: Entity,
  components: Component[],
  model: Model,
) => {
  // entity
  insert(part, entity, uint32)
  // component length
  insert(part, components.length, uint8)

  for (let i = 0; i < components.length; i++) {
    const component = components[i]
    const componentTypeId = component.__type__
    const componentEncoded = encode(component, model[componentTypeId])
    // component type id
    insert(part, componentTypeId, uint8)
    // encoded component length
    insert(part, componentEncoded.byteLength, uint16)
    // encoded component
    insertBuffer(part, componentEncoded)
  }
}

const insertBuffer = (part: Part, data: ArrayBuffer) => {
  part.data.push(data)
  part.type.push(null)
  part.byteLength += data.byteLength
}

export const encodeMessage = (
  message: Message,
  includeModel = false,
): ArrayBuffer => {
  const { parts } = message
  let length = 0

  for (let i = 0; i < parts.length; i++) {
    // header
    length += uint16.byteLength
    // exclude model
    if (i === 1 && includeModel === false) {
      continue
    }
    // part
    length += parts[i].byteLength
  }

  const buffer = new ArrayBuffer(length)
  const bufferView = new DataView(buffer)

  let offset = 0

  for (let i = 0; i < parts.length; i++) {
    // exclude model
    if (i === 1 && includeModel === false) {
      offset = encodePartHeader(bufferView, offset, 0)
    } else {
      offset = encodePart(
        buffer,
        bufferView,
        offset,
        message,
        i as Indices<Parts>,
      )
    }
  }

  return buffer
}
export { encodeMessage as encode }

export const createMessage = (model: Model): Message => {
  const partModel = createPart()
  insertBuffer(partModel, encodeModel(model))
  return {
    parts: [
      createPart(),
      partModel,
      createPart(),
      createPart(),
      createPart(),
      { ...createPart(), changesByEntity: new Map() },
      createPart(),
      createPart(),
    ],
    model,
    modelFlat: flattenModel(model),
  }
}

export const copy = (from: Message, to: Message): Message => {
  const { parts } = from
  for (let j = 0; j < parts.length; j++) {
    const { type, data, byteLength } = parts[j]
    const dest = to.parts[j]
    const { data: dataDest, type: dataType } = dest
    for (let k = 0; k < data.length; k++) {
      dataDest.push(data[k])
      dataType.push(type[k])
    }
    dest.byteLength += byteLength
  }
  return to
}

export const reset = (message: Message) => {
  const { parts } = message
  for (let i: Indices<Parts> = 0; i < parts.length; i++) {
    const part = parts[i]
    switch (i) {
      case 5:
        ;(part as PartPatch).changesByEntity.clear()
      default:
        mutableEmpty(part.data)
        mutableEmpty(part.type)
        part.byteLength = 0
        break
    }
  }
}

export const spawn = (
  message: Message,
  entity: Entity,
  components: Component[] = [],
) => insertEntityComponents(message.parts[2], entity, components, message.model)

export const attach = (
  message: Message,
  entity: Entity,
  ...components: Component[]
) => insertEntityComponents(message.parts[3], entity, components, message.model)

export const update = (
  message: Message,
  entity: Entity,
  ...components: Component[]
) => insertEntityComponents(message.parts[4], entity, components, message.model)

const calcChangeByteLength = (
  changes: ObserverChangeSet,
  type: ModelFlat[keyof ModelFlat],
) => {
  const { object, array } = changes

  // object count + array count
  let byteLength = uint8.byteLength * 2

  for (const prop in object) {
    const change = object[prop]
    if (change.value === NO_OP) {
      continue
    }
    const {
      record: { field, traverse },
    } = change
    // field
    byteLength += uint8.byteLength
    // traverse length
    byteLength += uint8.byteLength
    // traverse keys
    byteLength += uint16.byteLength * (traverse?.length ?? 0)
    // value
    const node = type[field]
    assert(
      node.kind === ModelNodeKind.Primitive,
      "Failed to encode change: only primitive field mutations are currently supported",
    )
    byteLength += dataTypeToView(node.type).byteLength
  }

  for (let i = 0; i < array.length; i++) {
    const change = array[i]
    const {
      record: { field, traverse },
    } = change
    // field
    byteLength += uint8.byteLength
    // traverse length
    byteLength += uint8.byteLength
    // traverse keys
    byteLength += uint16.byteLength * (traverse?.length ?? 0)
    // array method
    byteLength += uint8.byteLength
    if (
      change.method === MutArrayMethod.Pop ||
      change.method === MutArrayMethod.Shift
    ) {
      continue
    }
    // insert length
    byteLength += uint8.byteLength

    const node = type[field]
    assert(
      node.kind === ModelNodeKind.Primitive,
      "Failed to encode change: only primitive field mutations are currently supported",
    )

    // insert values
    byteLength += dataTypeToView(node.type).byteLength * change.values.length

    if (change.method === MutArrayMethod.Splice) {
      // index
      byteLength += uint8.byteLength
      // remove
      byteLength += uint8.byteLength
    }
  }

  return byteLength
}

export const patch = (
  message: Message,
  entity: Entity,
  componentTypeId: number,
  changes: ObserverChangeSet,
) => {
  const part = message.parts[5]

  let delta = 0
  let changeMap = part.changesByEntity.get(entity)

  if (changeMap === undefined) {
    changeMap = new Map()
    part.changesByEntity.set(entity, changeMap)
    // (p.1) entity
    delta += uint32.byteLength
  }

  const fields = message.modelFlat[componentTypeId]
  const existing = changeMap.get(componentTypeId)

  if (existing) {
    delta -= calcChangeByteLength(existing, fields)
  } else {
    // (p.2) component id
    delta += uint8.byteLength
    // (p.2.a) field count
    delta += uint8.byteLength
  }

  changeMap.set(componentTypeId, changes)

  part.byteLength += delta + calcChangeByteLength(changes, fields)
}

export const detach = (
  message: Message,
  entity: Entity,
  ...componentTypeIds: number[]
) => {
  const part = message.parts[6]
  const length = componentTypeIds.length
  insert(part, entity, uint32)
  insert(part, length, uint8)
  for (let i = 0; i < length; i++) {
    insert(part, componentTypeIds[i], uint8)
  }
}

export const destroy = (message: Message, entity: Entity) => {
  const part = message.parts[7]
  insert(part, entity, uint32)
}

export const tick = (message: Message, tick: number) => {
  const part = message.parts[0]
  insert(part, tick, uint32)
}

export function decodeModel(
  buffer: ArrayBuffer,
  bufferView: DataView,
  offset: number,
  onModel: (model: Model) => void,
) {
  const length = uint16.read(bufferView, offset, 0)
  // header
  offset += uint16.byteLength
  if (length === 0) {
    return offset
  }

  const config = new Map()
  const encoded = new Uint8Array(buffer, offset, length)

  let i = 0

  while (i < length) {
    const schema = {}
    const componentTypeId = encoded[i++]
    i = decodeSchema(encoded, i, schema)
    config.set(componentTypeId, schema)
  }

  onModel(createModel(config))

  return offset + length
}

function decodeEntityComponentsPart(
  buffer: ArrayBuffer,
  bufferView: DataView,
  model: Model,
  offset: number,
  onInsert: (entity: number, components: Component[]) => void,
) {
  const length = uint16.read(bufferView, offset, 0)
  const end = offset + length

  offset += uint16.byteLength

  while (offset < end) {
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
      const component = decode<Component>(
        encodedComponent,
        model[componentTypeId],
      )
      ;(component as any).__type__ = componentTypeId
      components.push(component)
    }

    onInsert(entity, components)
  }

  return offset
}

function decodeDetach(
  bufferView: DataView,
  offset: number,
  onDetach: (entity: number, componentTypeIds: number[]) => void,
) {
  const detachLength = uint16.read(bufferView, offset, 0)
  const detachEnd = offset + detachLength

  offset += uint16.byteLength

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
  const destroyLength = uint16.read(bufferView, offset, 0)
  const destroyEnd = offset + destroyLength

  offset += uint16.byteLength

  while (offset < destroyEnd) {
    const entity = uint32.read(bufferView, offset, 0)
    offset += uint32.byteLength
    onDestroy(entity)
  }

  return offset
}

export type DecodeMessageHandlers = {
  onTick(tick: number): void
  onModel(model: Model): void
  onCreate(entity: number, components: Component[]): void
  onAttach(entity: number, components: Component[]): void
  onUpdate(entity: number, components: Component[]): void
  onDetach(entity: number, componentTypeIds: number[]): void
  onDestroy(entity: number): void
  onPatch(
    buffer: ArrayBuffer,
    bufferView: DataView,
    model: Model,
    offset: number,
  ): void
}

export function decodeMessage(
  buffer: ArrayBuffer,
  handlers: DecodeMessageHandlers,
  model?: Model,
) {
  const {
    onTick,
    onModel,
    onCreate,
    onAttach,
    onUpdate,
    onDetach,
    onDestroy,
    onPatch,
  } = handlers
  const _onModel = (m: Model) => {
    model = m
    onModel(m)
  }
  const bufferView = new DataView(buffer)

  let offset = 0

  const tickLength = uint16.read(bufferView, offset)
  offset += uint16.byteLength

  if (tickLength > 0) {
    const tick = uint32.read(bufferView, offset, 0)
    onTick(tick)
    offset += tickLength
  }

  offset = decodeModel(buffer, bufferView, offset, _onModel)
  assert(
    model !== undefined,
    "Failed to decode network message: model not provided to decodeMessage() nor, was it encoded in message",
  )
  // spawn
  offset = decodeEntityComponentsPart(
    buffer,
    bufferView,
    model,
    offset,
    onCreate,
  )
  // attach
  offset = decodeEntityComponentsPart(
    buffer,
    bufferView,
    model,
    offset,
    onAttach,
  )
  // update
  offset = decodeEntityComponentsPart(
    buffer,
    bufferView,
    model,
    offset,
    onUpdate,
  )
  // TODO: patch iterator
  // patch
  const patchLength = uint16.read(bufferView, offset)
  onPatch(buffer, bufferView, model, offset)
  offset += patchLength + uint16.byteLength
  // detach
  offset = decodeDetach(bufferView, offset, onDetach)
  // destroy
  offset = decodeDestroy(bufferView, offset, onDestroy)
}
