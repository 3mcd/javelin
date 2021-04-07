import {
  assert,
  Component,
  ErrorType,
  mutableEmpty,
  number,
  World,
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

export type Model = Map<number, Schema>

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

type Insert = (number | ArrayBuffer)[]
type Detach = number[]
type Destroy = number[]
type Patch = (number | ArrayBuffer)[]

type Patches = Map<number, Map<number, number | ArrayBuffer>>

function getFieldPath(schema: Schema, keyIndex: number) {
  let visiting: Schema | Field = schema
  let indices = 0

  outer: while (keyIndex > 0) {
    if (Array.isArray(schema)) {
      visiting = schema[0]
      keyIndex--
    } else {
      for (const prop in schema) {
        visiting = schema[prop]
        keyIndex--
        if (!isField(schema[prop])) {
          continue outer
        }
      }
    }

    if (isField(visiting) && keyIndex > 0) {
      throw new Error("Failed to find field in schema")
    }
  }

  return [field, indices]
}

function decodePatches(
  world: World,
  model: Model,
  view: DataView,
  length: number,
  offset: number,
) {
  while (length > 0) {
    const e = uint32.read(view, offset)
    const c = uint8.read(view, offset)
    const f = uint8.read(view, offset)
    // const [field, indices] = getFieldPath(model.get(c)!, f)
    const component = world.storage.findComponentByComponentTypeId(e, c)
  }
}

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

// function getFieldAtSchemaKeyIndex(schema: Schema, keyIndex: number) {
//   let visiting: Schema | Field = schema

//   outer: while (keyIndex > 0) {
//     if (Array.isArray(schema)) {
//       visiting = schema[0]
//       keyIndex--
//     } else {
//       for (const prop in schema) {
//         visiting = schema[prop]
//         keyIndex--
//         if (!isField(schema[prop])) {
//           continue outer
//         }
//       }
//     }

//     if (isField(visiting) && keyIndex > 0) {
//       throw new Error("Failed to find field in schema")
//     }
//   }

//   return visiting
// }

// class PatchPart implements MessageWriter {
//   private entities = new Map<number, Map<number, (number | ArrayBuffer)[]>>()

//   insert(
//     model: Model,
//     entity: number,
//     componentTypeId: number,
//     keyIndex: number,
//     value: number | ArrayBuffer,
//     arrayIndex?: number,
//   ) {
//     const patch = this.entities.get(entity)
//     assert(patch !== undefined, "")
//     const componentPatch = patch.get(componentTypeId)
//     assert(componentPatch !== undefined, "")
//     componentPatch.push(keyIndex)
//     if (arrayIndex !== undefined) {
//       componentPatch.push(arrayIndex)
//     }
//     componentPatch.push(value)
//   }

//   write(model: Model, buffer: ArrayBuffer, bufferView: DataView, offset: number) {
//     for (const [entity, entityPatches] of this.entities) {
//       bufferView.setUint32(offset, entity)
//       offset += uint32.byteLength
//       for (const [componentTypeId, componentPatches] of entityPatches) {
//         const schema = model.get(componentTypeId)
//         assert(schema !== undefined, "")
//         bufferView.setUint8(offset, componentTypeId)
//         offset += uint8.byteLength
//         let i = 0
//         while (i < componentPatches.length) {
//           const keyIndex = componentPatches[i++] as number
//           bufferView.setUint8(offset, keyIndex)
//           offset += uint8.byteLength
//           const field = getFieldAtSchemaKeyIndex(schema, keyIndex)

//           if (isField(field)) {
//             // field
//           } else if (Array.isArray(field)) {
//             const arrayIndex = componentPatches[i++]

//             // array op
//             field
//           } else {
//             const data = componentPatches[i++] as ArrayBuffer
//             assert(data instanceof ArrayBuffer, "")
//             // schema – copy buffer
//           }

//           field.type.write(bufferView, offset, )

//           const index = componentPatches[i++]

//           if ()
//         }
//       }
//     }
//     return offset
//   }
// }

export class MessageBuilder {
  private tick = 0
  private parts = [
    new MessagePart<Model[]>(),
    new MessagePart<Insert>(), // spawn
    new MessagePart<Insert>(), // attach
    new MessagePart<Insert>(), // update
    new MessagePart<Detach>(),
    new MessagePart<Destroy>(),
    new MessagePart<Patch>(),
  ] as const

  constructor(private schemas: Map<number, Schema>) {}

  private encodeComponent(component: Component): ArrayBuffer {
    const componentSchema = this.schemas.get(component._tid)

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

  patch(
    entity: number,
    key: number,
    value: number | ArrayBuffer,
    view: View<number>,
    index?: number,
  ) {
    const patch = this.parts[6]
    patch.insert(entity, uint32)
    patch.insert(key, uint8)
    if (index !== undefined) {
      patch.insert(index, uint16)
    }
    patch.insert(value, view)
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

  const model = new Map<number, Schema>()
  const encoded = new Uint8Array(buffer, offset, length)

  let i = 0

  while (i < length) {
    const schema = {}
    const componentTypeId = encoded[i++]
    i = decodeSchema(encoded, i, schema)
    model.set(componentTypeId, schema)
  }

  onModel(model)

  return offset + length
}

function decodeInsert(
  buffer: ArrayBuffer,
  bufferView: DataView,
  model: Map<number, Schema>,
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
      const component = decode(encodedComponent, model.get(componentTypeId)!)
      component._tid = componentTypeId
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

function decodePatch(
  buffer: ArrayBuffer,
  bufferView: DataView,
  model: Map<number, Schema>,
  offset: number,
) {}

export type DecodeMessageHandlers = {
  onTick(tick: number): void
  onModel(model: Model): void
  onCreate(entity: number, components: Component[]): void
  onAttach(entity: number, components: Component[]): void
  onUpdate(entity: number, components: Component[]): void
  onDetach(entity: number, componentTypeIds: number[]): void
  onDestroy(entity: number): void
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
  offset = decodeInsert(buffer, bufferView, model!, offset, onCreate)
  offset = decodeInsert(buffer, bufferView, model!, offset, onAttach)
  offset = decodeInsert(buffer, bufferView, model!, offset, onUpdate)
  offset = decodeDetach(bufferView, offset, onDetach)
  offset = decodeDestroy(bufferView, offset, onDestroy)
  // offset = decodePatch(buffer, bufferView, model!, offset, () => {})
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
    const keys = Object.keys(schema).sort((a, b) => a.localeCompare(b))
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

export type SchemaRecordBase = {
  id: number
  cid: number
  key?: string
  parent: SchemaRecordBase | null
}

export type SchemaArrayRecord = SchemaRecordBase & {
  type: SchemaRecord
  array: true
}

export type SchemaStructRecord = SchemaRecordBase & {
  type: { [key: string]: SchemaRecord | Field }
}

export type SchemaRecord = SchemaArrayRecord | SchemaStructRecord

export function flattenSchema(
  schema: Schema,
  parent: SchemaStructRecord,
  offset = 0,
) {
  const keys = Object.keys(schema).sort((a, b) => a.localeCompare(b))

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const child = (schema as any)[key]
    const record: SchemaRecordBase = {
      id: ++offset,
      cid: parent.cid,
      key,
      parent,
    }

    if (Array.isArray(child)) {
      ;(record as SchemaArrayRecord).array = true
      const entry = child[0]
      if (isField(entry)) {
        ;(record as SchemaArrayRecord).type = {
          id: ++offset,
          cid: parent.cid,
          type: entry as any,
          parent,
        }
      } else {
        const element = {
          id: ++offset,
          cid: parent.cid,
          type: {},
          parent,
        }
        ;(record as any).type = element
        offset = flattenSchema(entry, element, offset)
      }
    } else if (!isField(child)) {
      ;(record as SchemaStructRecord).type = {}
      offset = flattenSchema(child, record as SchemaStructRecord, offset)
    } else {
      ;(record as any).type = child
    }

    parent.type[key] = record as SchemaRecord
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
