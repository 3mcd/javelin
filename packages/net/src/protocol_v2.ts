import {
  Component,
  mutableEmpty,
  SerializedComponentType,
  assert,
  ErrorType,
} from "@javelin/ecs"
import {
  decode,
  encode,
  field,
  Field,
  float32,
  float64,
  int16,
  int32,
  int8,
  isField,
  Schema,
  string16,
  string8,
  uint16,
  uint32,
  uint8,
  View,
} from "@javelin/pack"

export interface NetProtocol {
  updateModel(model: Model): void
}

type Model = Map<number, Schema>
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
    new MessagePart<Model[]>(),
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
    entity: number,
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
    this.parts[0].reset()
    this.parts[0].insertBuffer(encodeModel(model))
  }

  spawn(entity: number, components: Component[]) {
    this._attach(entity, components, this.parts[1])
  }

  attach(entity: number, components: Component[]) {
    this._attach(entity, components, this.parts[2])
  }

  update(entity: number, components: Component[]) {
    this._attach(entity, components, this.parts[3])
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

  offset += uint32.byteLength

  const length = modelLength - uint32.byteLength

  if (length === 0) {
    return offset
  }

  const model = new Map<number, Schema>()
  const encoded = new Uint8Array(buffer, offset, length)

  let o = 0

  while (o < length) {
    const schema = {}
    const componentTypeId = encoded[o++]
    o = decodeSchema(encoded, o, schema)
    model.set(componentTypeId, schema)
  }

  onModel(model)

  return offset + length
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

type DecodeMessageHandlers = {
  onTick: (tick: number) => void
  onModel: (model: Model) => void
  onCreate: (entity: number, components: Component[]) => void
  onAttach: (entity: number, components: Component[]) => void
  onUpdate: (entity: number, components: Component[]) => void
  onDetach: (entity: number, componentTypeIds: number[]) => void
  onDestroy: (entity: number) => void
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
    "Failed to decode network message: unable to resolve component model",
  )
  offset = decodeAttach(buffer, bufferView, model!, offset, onCreate)
  offset = decodeAttach(buffer, bufferView, model!, offset, onAttach)
  offset = decodeAttach(buffer, bufferView, model!, offset, onUpdate)
  offset = decodeDetach(bufferView, offset, onDetach)
  offset = decodeDestroy(bufferView, offset, onDestroy)
}

type Views =
  | typeof uint8
  | typeof uint16
  | typeof uint32
  | typeof int8
  | typeof int16
  | typeof int32
  | typeof float32
  | typeof float64
  | typeof string8
  | typeof string16

const dataTypeIds = new Map<string, number>([
  ["uint8", 0],
  ["uint16", 1],
  ["uint32", 2],
  ["int8", 3],
  ["int16", 4],
  ["int32", 5],
  ["float32", 6],
  ["float64", 7],
  ["string8", 8],
  ["string16", 9],
])

const dataTypeIdsLookup = new Map<number, Views>([
  [0, uint8],
  [1, uint16],
  [2, uint32],
  [3, int8],
  [4, int16],
  [5, int32],
  [6, float32],
  [7, float64],
  [8, string8],
  [9, string16],
])

const SCHEMA_MASK = 1 << 7
const ARRAY = 10

function getFieldId(field: Field) {
  const id = dataTypeIds.get(field.type.name)
  assert(id !== undefined, "", ErrorType.Internal)
  return id
}

function encodeSchema(schema: Schema, out: number[]) {
  let offset = 0

  if (Array.isArray(schema)) {
    const element = schema[0]
    out.push(ARRAY)
    offset++
    if (isField(element)) {
      out.push(getFieldId(element))
      offset++
    } else {
      offset += encodeSchema(element, out)
    }
  } else if (isField(schema)) {
    out.push(getFieldId(schema))
    offset++
  } else {
    const keys = Object.keys(schema)
    const length = keys.length
    out.push(length | SCHEMA_MASK)
    offset++
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = schema[keys[i]]
      out.push(key.length)
      offset++
      for (let i = 0; i < key.length; i++) {
        out.push(key.charCodeAt(i))
        offset++
      }
      if (isField(value)) {
        out.push(getFieldId(value))
        offset++
      } else {
        offset += encodeSchema(value, out)
      }
    }
  }

  return offset
}

export function encodeModel(model: Map<number, Schema>) {
  const flat: number[] = []

  let size = 0

  model.forEach((schema, id) => {
    flat.push(id)
    size += encodeSchema(schema, flat) + 1
  })
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
    const dataType = encoded[offset++]
    if (dataType === ARRAY) {
      const wrapper: (Field | Schema)[] = []
      const elementType = encoded[offset++]
      if ((elementType & SCHEMA_MASK) !== 0) {
        const elementSchema = {}
        offset = decodeSchema(encoded, offset - 1, elementSchema)
        wrapper[0] = elementSchema
      } else {
        wrapper[0] = field(dataTypeIdsLookup.get(elementType) as View<any>)
      }
      ;(schema as any)[key] = wrapper
    } else if ((dataType & SCHEMA_MASK) !== 0) {
      const child: Schema = {}
      offset = decodeSchema(encoded, offset - 1, child)
      ;(schema as any)[key] = child
    } else {
      ;(schema as any)[key] = field(
        dataTypeIdsLookup.get(dataType) as View<any>,
      )
    }
  }

  return offset
}
