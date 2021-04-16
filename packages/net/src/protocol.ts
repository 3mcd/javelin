import { Component } from "@javelin/ecs"
import {
  arrayOf,
  assert,
  ChangeSet,
  createModel,
  DataType,
  ErrorType,
  flattenModel,
  Model,
  ModelConfig,
  ModelFlat,
  ModelNode,
  ModelNodeKind,
  mutableEmpty,
  NO_OP,
  Schema,
  SchemaKey,
} from "@javelin/model"
import {
  boolean,
  decode,
  encode,
  float32,
  float64,
  int16,
  int32,
  int8,
  string16,
  string8,
  uint16,
  uint32,
  uint8,
  View,
} from "@javelin/pack"

// A single State message consists of several parts:
//   (T) current server tick
//   (M) model
//   (S) spawned entities and their components
//   (A) attached components
//   (U) updated components
//   (D) detached components
//   (X) destroyed entities
//   (P) patched entities
//
// The message layout looks like:
//   [T, M, S[], A[], U[], D[], X[] P[]]

type Insert = (number | ArrayBuffer)[]
type Detach = number[]
type Destroy = number[]
type Patch = (number | ArrayBuffer)[]

interface MessageWriter {
  write(buffer: ArrayBuffer, bufferView: DataView, offset: number): number
}

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
> implements MessageWriter {
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
    uint32.write(bufferView, offset, this._byteLength)
    offset += uint32.byteLength

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
    new MessagePart<ModelConfig[]>(),
    new MessagePart<Insert>(), // spawn
    new MessagePart<Insert>(), // attach
    new MessagePart<Insert>(), // update
    new MessagePart<Detach>(),
    new MessagePart<Destroy>(),
    new MessagePart<Patch>(),
  ] as const
  private _model: Model
  private _modelFlat: ModelFlat

  constructor(model: Model) {
    this._model = model
    this._modelFlat = flattenModel(model)
    this.model(model)
  }

  private encodeComponent(component: Component): ArrayBuffer {
    const componentSchema = this._model[component._tid]

    if (!componentSchema) {
      throw new Error("Failed to encode component: type not found in model")
    }

    return encode(component as any, componentSchema)
  }

  private insert(
    entity: number,
    components: Component[],
    target: MessagePart<Insert>,
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
    if (model !== this._model) {
      this._model = model
      this._modelFlat = flattenModel(model)
    }

    this.parts[0].reset()
    this.parts[0].insertBuffer(encodeModel(model))
  }

  spawn(entity: number, components: Component[]) {
    this.insert(entity, components, this.parts[1])
  }

  attach(entity: number, components: Component[]) {
    this.insert(entity, components, this.parts[2])
  }

  update(entity: number, components: Component[]) {
    this.insert(entity, components, this.parts[3])
  }

  patch(entity: number, cid: number, changes: ChangeSet) {
    const patch = this.parts[6]
    const { fields, fieldsCount } = changes

    if (fieldsCount === 0) {
      return
    }

    patch.insert(entity, uint32)
    patch.insert(cid, uint8)
    patch.insert(fieldsCount, uint8)

    for (const prop in fields) {
      const change = fields[prop]
      if (change === NO_OP) {
        continue
      }
      const { field, traverse, value } = change
      const node = this._modelFlat[cid][field]
      assert(node !== undefined, "model does not contain component id or field")
      assert(
        node.kind === ModelNodeKind.Primitive,
        "complex types not yet supported in patches",
      )
      patch.insert(field, uint8)
      patch.insert(traverse?.length ?? 0, uint8)

      if (traverse !== undefined) {
        for (let i = 0; i < traverse.length; i++) {
          // TODO: support map (ie. dont convert string path to int)
          patch.insert(+traverse[i], uint16)
        }
      }

      // TODO: support complex types
      patch.insert(value, node.type as View)
    }
  }

  detach(entity: number, componentTypeIds: number[]) {
    const detach = this.parts[4]
    detach.insert(entity, uint32)
    detach.insert(componentTypeIds.length, uint8)
    for (let i = 0; i < componentTypeIds.length; i++) {
      detach.insert(componentTypeIds[i], uint8)
    }
  }

  destroy(entity: number) {
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

export function decodeModel(
  buffer: ArrayBuffer,
  bufferView: DataView,
  offset: number,
  onModel: (model: Model) => void,
) {
  const modelLength = uint32.read(bufferView, offset, 0)
  const length = modelLength - uint32.byteLength

  offset += uint32.byteLength

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

function decodeInsert(
  buffer: ArrayBuffer,
  bufferView: DataView,
  model: Model,
  offset: number,
  onInsert: (entity: number, components: Component[]) => void,
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
      const component = decode<Component>(
        encodedComponent,
        model[componentTypeId],
      )
      ;(component as any)._tid = componentTypeId
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
  const tick = uint32.read(bufferView, 0, 0)

  let offset = uint32.byteLength

  onTick(tick)

  offset = decodeModel(buffer, bufferView, offset, _onModel)
  assert(
    model !== undefined,
    "Failed to decode network message: model not loaded",
  )
  offset = decodeInsert(buffer, bufferView, model, offset, onCreate)
  offset = decodeInsert(buffer, bufferView, model, offset, onAttach)
  offset = decodeInsert(buffer, bufferView, model, offset, onUpdate)
  offset = decodeDetach(bufferView, offset, onDetach)
  offset = decodeDestroy(bufferView, offset, onDestroy)
  onPatch(buffer, bufferView, model, offset)
}

const DATA_TYPE_IDS: { [key: string]: number } = {
  uint8: 0,
  uint16: 1,
  uint32: 2,
  int8: 3,
  int16: 4,
  int32: 5,
  float32: 6,
  float64: 7,
  string8: 8,
  string16: 9,
  boolean: 10,
}

const DATA_TYPE_IDS_LOOKUP = [
  uint8,
  uint16,
  uint32,
  int8,
  int16,
  int32,
  float32,
  float64,
  string8,
  string16,
  boolean,
]

const SCHEMA_MASK = 1 << 7
const ARRAY = DATA_TYPE_IDS_LOOKUP.length

function getDataTypeId(field: DataType) {
  const id = DATA_TYPE_IDS[field.__type__]
  assert(id !== undefined, "", ErrorType.Internal)
  return id
}

function encodeModelNode(node: ModelNode, out: number[], offset: number = 0) {
  switch (node.kind) {
    case ModelNodeKind.Primitive:
      out.push(getDataTypeId(node.type))
      offset++
      break
    case ModelNodeKind.Array:
      out.push(ARRAY)
      offset++
      offset = encodeModelNode(node.edge, out, offset)
      break
    // TODO: support map
    case ModelNodeKind.Map:
      break
    case ModelNodeKind.Struct: {
      const length = node.edges.length
      out.push(length | SCHEMA_MASK)
      offset++
      for (let i = 0; i < node.edges.length; i++) {
        const edge = node.edges[i]
        const { key } = edge
        out.push(key.length)
        offset++
        for (let i = 0; i < key.length; i++) {
          out.push(key.charCodeAt(i))
          offset++
        }
        offset = encodeModelNode(node.edges[i], out, offset)
      }
      break
    }
  }

  return offset
}

export function encodeModel(model: Model) {
  const flat: number[] = []

  let size = 0

  for (const prop in model) {
    flat.push(+prop)
    size += encodeModelNode(model[prop], flat) + 1
  }

  const buffer = new ArrayBuffer(size)
  const encoded = new Uint8Array(buffer)

  for (let i = 0; i < flat.length; i++) {
    encoded[i] = flat[i]
  }

  return buffer
}

export function decodeSchema(
  encoded: Uint8Array,
  offset: number,
  schema: Schema,
) {
  let length = encoded[offset++] & ~SCHEMA_MASK
  while (length-- > 0) {
    let keySize = encoded[offset++]
    let key = ""
    while (keySize-- > 0) {
      key += String.fromCharCode(encoded[offset++])
    }
    const dataTypeId = encoded[offset++]
    if (dataTypeId === ARRAY) {
      const wrapper = arrayOf(uint8 as SchemaKey)
      const elementType = encoded[offset++]
      if ((elementType & SCHEMA_MASK) !== 0) {
        const elementSchema = {}
        offset = decodeSchema(encoded, offset - 1, elementSchema)
        wrapper.__type__ = elementSchema
      } else {
        wrapper.__type__ = DATA_TYPE_IDS_LOOKUP[elementType]
      }
      schema[key] = wrapper
    } else if ((dataTypeId & SCHEMA_MASK) !== 0) {
      const child: Schema = {}
      offset = decodeSchema(encoded, offset - 1, child)
      schema[key] = child
    } else {
      schema[key] = DATA_TYPE_IDS_LOOKUP[dataTypeId]
    }
  }

  return offset
}
