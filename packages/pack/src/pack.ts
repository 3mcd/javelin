import {
  $kind,
  CollatedNode,
  FieldArray,
  FieldKind,
  FieldMap,
  FieldObject,
  FieldSet,
  isField,
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
  field: ByteView | StringView,
  value: T,
) {
  const length = (field as StringView).length ?? null
  const byteLength = field.byteLength * (length ?? 1)
  out.push({
    view: field,
    value:
      length !== null ? (value as unknown as string).slice(0, length) : value,
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
  node: CollatedNode,
  object: any,
  offset = 0,
) {
  if (isField(node)) {
    switch (node[$kind]) {
      case FieldKind.Number:
      case FieldKind.String:
      case FieldKind.Boolean:
        offset += pushBufferField(out, fieldToByteView(node), object)
        break
      case FieldKind.Array: {
        offset += pushCollectionLengthField(out, object.length)
        for (let i = 0; i < object.length; i++) {
          offset = serialize(
            out,
            (node as FieldArray<unknown>).element as CollatedNode,
            object[i],
            offset,
          )
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
            fieldToByteView((node as FieldObject<unknown>).key),
            key,
          )
          offset = serialize(
            out,
            (node as FieldObject<unknown>).element as CollatedNode,
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
            (node as FieldSet<unknown>).element as CollatedNode,
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
            fieldToByteView((node as FieldMap<unknown, unknown>).key),
            key,
          )
          offset = serialize(
            out,
            (node as FieldMap<unknown, unknown>).element as CollatedNode,
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
  type: CollatedNode,
  cursor = { offset: 0 },
): ArrayBuffer {
  const bufferFields: BufferField[] = []
  const bufferSize = serialize(bufferFields, type, object)
  const buffer = new ArrayBuffer(bufferSize)
  const dataView = new DataView(buffer)

  for (let i = 0; i < bufferFields.length; i++) {
    const bufferField = bufferFields[i]
    write(
      dataView,
      bufferField.view,
      cursor,
      bufferField.value as number | string | boolean,
    )
  }

  return buffer
}

const decodeInner = (
  dataView: DataView,
  node: CollatedNode,
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
      return read(dataView, fieldToByteView(node), cursor)
    }
    case FieldKind.Array: {
      const length = uint32.read(dataView, cursor.offset, 0)
      const array = [] as Record<number, unknown>
      cursor.offset += uint32.byteLength
      for (let i = 0; i < length; i++) {
        array[i] = decodeInner(
          dataView,
          (node as FieldArray<unknown>).element as CollatedNode,
          cursor,
        )
      }
      return array
    }
    case FieldKind.Object: {
      const keyByteView = fieldToByteView(
        (node as FieldObject<unknown>).key,
      ) as StringView
      const length = read(dataView, uint32, cursor)
      const object: { [key: string]: unknown } = {}
      for (let i = 0; i < length; i++) {
        const key = read(dataView, keyByteView, cursor)
        object[key] = decodeInner(
          dataView,
          (node as FieldObject<unknown>).element as CollatedNode,
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
            (node as FieldSet<unknown>).element as CollatedNode,
            cursor,
          ),
        )
      }
      return set
    }
    case FieldKind.Map: {
      const keyByteView = fieldToByteView(
        (node as FieldObject<unknown>).key as ByteView,
      )
      const length = read(dataView, uint32, cursor)
      const map = new Map()
      for (let i = 0; i < length; i++) {
        const key = read(dataView, keyByteView, cursor)
        map.set(
          key,
          decodeInner(
            dataView,
            (node as FieldObject<unknown>).element as CollatedNode,
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
  type: CollatedNode,
  cursor: Cursor = { offset: 0 },
) {
  return decodeInner(new DataView(buffer), type, cursor) as T
}

export * from "./views"
