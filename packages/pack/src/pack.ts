import {
  $kind,
  CollatedNode,
  createModel,
  Field,
  FieldArray,
  FieldKind,
  FieldMap,
  FieldObject,
  FieldSet,
  isField,
  isPrimitiveField,
  Model,
  Schema,
} from "@javelin/core"
import {
  ByteView,
  fieldToByteView,
  read,
  StringView,
  uint32,
  write,
} from "./views"

export type Cursor = {
  offset: number
}

type BufferField = {
  view: ByteView
  value: unknown
  byteLength: number
}

function pushBufferField<T>(
  out: BufferField[],
  byteView: ByteView | StringView,
  value: T,
  length = (byteView as StringView).length ?? 1,
) {
  const byteLength = length * byteView.byteLength
  out.push({
    view: byteView,
    value:
      byteView[$kind] === FieldKind.String
        ? (value as unknown as string).slice(0, length)
        : value,
    byteLength,
  })
  return byteLength
}

function pushCollectionLengthField(out: BufferField[], length: number) {
  out.push({
    view: uint32,
    value: length,
    byteLength: uint32.byteLength,
  })
  return uint32.byteLength
}

export function serialize(
  out: BufferField[],
  node: CollatedNode<ByteView>,
  object: any,
  offset = 0,
) {
  if (isField(node)) {
    switch (node[$kind]) {
      case FieldKind.Number:
      case FieldKind.String:
      case FieldKind.Boolean:
        offset += pushBufferField(
          out,
          node as ByteView,
          object,
          (node as unknown as StringView).length,
        )
        break
      case FieldKind.Array: {
        const element = (node as FieldArray<unknown>)
          .element as CollatedNode<ByteView>
        offset += pushCollectionLengthField(out, object.length)
        for (let i = 0; i < object.length; i++) {
          offset = serialize(out, element, object[i], offset)
        }
        break
      }
      case FieldKind.Object: {
        const keys = Object.keys(object)
        offset += pushCollectionLengthField(out, keys.length)
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          offset += pushBufferField(
            out,
            (node as FieldObject<unknown>).key as ByteView,
            key,
          )
          offset = serialize(
            out,
            (node as FieldObject<unknown>).element as CollatedNode<ByteView>,
            object[key],
            offset,
          )
        }
        break
      }
      case FieldKind.Set:
        offset += pushCollectionLengthField(out, object.size)
        object.forEach((element: unknown) => {
          offset = serialize(
            out,
            (node as FieldSet<unknown>).element as CollatedNode<ByteView>,
            element,
            offset,
          )
        })
        break
      case FieldKind.Map:
        offset += pushCollectionLengthField(out, object.size)
        ;(object as Map<number | string, unknown>).forEach((element, key) => {
          offset += pushBufferField(
            out,
            (node as FieldMap<unknown, unknown>).key as ByteView,
            key,
          )
          offset = serialize(
            out,
            (node as FieldMap<unknown, unknown>)
              .element as CollatedNode<ByteView>,
            element,
            offset,
          )
        })
        break
    }
  } else {
    for (let i = 0; i < node.fields.length; i++) {
      const edge = node.fields[i]
      offset = serialize(out, edge, object[node.keys[i]], offset)
    }
  }

  return offset
}

export function encode(
  object: any,
  node: CollatedNode<ByteView>,
  cursor = { offset: 0 },
): ArrayBuffer {
  const bufferFields: BufferField[] = []
  const bufferSize = serialize(bufferFields, node, object)
  const buffer = new ArrayBuffer(bufferSize)
  const dataView = new DataView(buffer)
  for (let i = 0; i < bufferFields.length; i++) {
    const { view, value } = bufferFields[i]
    write(dataView, view, cursor, value as number | string | boolean)
  }
  return buffer
}

const decodeInner = (
  dataView: DataView,
  node: CollatedNode<ByteView>,
  cursor: Cursor,
) => {
  if (!isField(node)) {
    const schema: { [key: string]: unknown } = {}
    for (let i = 0; i < node.fields.length; i++) {
      schema[node.keys[i]] = decodeInner(dataView, node.fields[i], cursor)
    }
    return schema
  }
  switch (node[$kind]) {
    case FieldKind.Number:
    case FieldKind.String:
    case FieldKind.Boolean: {
      return read(
        dataView,
        node as ByteView,
        cursor,
        (node as Field as StringView).length,
      )
    }
    case FieldKind.Array: {
      const length = read(dataView, uint32, cursor)
      const array = [] as Record<number, unknown>
      for (let i = 0; i < length; i++) {
        array[i] = decodeInner(
          dataView,
          (node as FieldArray<unknown>).element as CollatedNode<ByteView>,
          cursor,
        )
      }
      return array
    }
    case FieldKind.Object: {
      const length = read(dataView, uint32, cursor)
      const object: { [key: string]: unknown } = {}
      for (let i = 0; i < length; i++) {
        const key = read(
          dataView,
          (node as FieldObject<unknown>).key as StringView,
          cursor,
        )
        object[key] = decodeInner(
          dataView,
          (node as FieldObject<unknown>).element as CollatedNode<ByteView>,
          cursor,
        )
      }
      return object
    }
    case FieldKind.Set: {
      const length = read(dataView, uint32, cursor)
      const set = new Set()
      for (let i = 0; i < length; i++) {
        set.add(
          decodeInner(
            dataView,
            (node as FieldSet<unknown>).element as CollatedNode<ByteView>,
            cursor,
          ),
        )
      }
      return set
    }
    case FieldKind.Map: {
      const length = read(dataView, uint32, cursor)
      const map = new Map()
      for (let i = 0; i < length; i++) {
        const key = read(
          dataView,
          (node as FieldObject<unknown>).key as ByteView,
          cursor,
        )
        map.set(
          key,
          decodeInner(
            dataView,
            (node as FieldObject<unknown>).element as CollatedNode<ByteView>,
            cursor,
          ),
        )
      }
      return map
    }
  }
}

export function decode<T extends ReturnType<typeof decodeInner>>(
  buffer: ArrayBuffer,
  node: CollatedNode<ByteView>,
  cursor: Cursor = { offset: 0 },
) {
  return decodeInner(new DataView(buffer), node, cursor) as T
}

export type ModelEnhanced = Model<ByteView>

export function enhanceModelInner(node: CollatedNode) {
  if (isField(node)) {
    if (isPrimitiveField(node)) {
      Object.assign(node, fieldToByteView(node))
    } else {
      if ("element" in node) {
        enhanceModelInner(node.element as CollatedNode)
      }
      if ("key" in node) {
        enhanceModelInner(node.key as CollatedNode)
      }
    }
  } else {
    for (let i = 0; i < node.fields.length; i++) {
      enhanceModelInner(node.fields[i])
    }
  }
}

export function enhanceModel(model: Model): ModelEnhanced {
  for (const prop in model) {
    enhanceModelInner(model[prop])
  }
  return model as ModelEnhanced
}

export * from "./views"
