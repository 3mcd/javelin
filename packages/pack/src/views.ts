import * as Model from "@javelin/core"
import { $kind } from "@javelin/core"
import { Cursor } from "./pack"

export const $byteView = Symbol("javelin_byte_view")

export enum ByteViewKind {
  Uint8,
  Uint16,
  Uint32,
  Int8,
  Int16,
  Int32,
  Float32,
  Float64,
  String8,
  String16,
  Boolean,
}

export type PrimitiveField =
  | Model.FieldNumber
  | Model.FieldString
  | Model.FieldBoolean

export type ByteView<$Field extends PrimitiveField = PrimitiveField> =
  $Field & {
    [$byteView]: ByteViewKind
    byteLength: number
    read(
      dataView: DataView,
      offset: number,
      length?: number,
    ): Model.FieldGet<$Field>
    write(
      dataView: DataView,
      offset: number,
      data: Model.FieldGet<$Field>,
    ): void
  }

export type StringView = ByteView<Model.FieldString> & {
  [$byteView]: ByteViewKind.String16 | ByteViewKind.String8
  length?: number
}

export function isByteView(object: object): object is ByteView {
  return Model.isField(object) && "byteLength" in object
}

export function isStringView(object: object): object is StringView {
  return isByteView(object) && object[$kind] === Model.FieldKind.String
}

export function read<$View extends ByteView>(
  dataView: DataView,
  byteView: $View,
  cursor: Cursor,
  length = (byteView as StringView).length ?? 1,
) {
  const data = byteView.read(dataView, cursor.offset, length)
  cursor.offset += byteView.byteLength * length
  return data as Model.FieldGet<$View>
}

export function write<$View extends ByteView>(
  dataView: DataView,
  byteView: $View,
  cursor: Cursor,
  data: Model.FieldGet<$View>,
) {
  const length = (byteView as StringView).length ?? 1
  byteView.write(dataView, cursor.offset, data)
  cursor.offset += byteView.byteLength * length
}

function createByteView<$Field extends PrimitiveField>(
  kind: ByteViewKind,
  field: $Field,
  byteLength: number,
  read: (
    dataView: DataView,
    offset: number,
    length?: number,
  ) => Model.FieldGet<$Field>,
  write: (
    dataView: DataView,
    offset: number,
    data: Model.FieldGet<$Field>,
  ) => void,
): ByteView<$Field> {
  return {
    ...field,
    [$byteView]: kind,
    byteLength,
    read,
    write,
  }
}

export const uint8 = createByteView(
  ByteViewKind.Uint8,
  Model.number,
  1,
  (dataView, offset) => dataView.getUint8(offset),
  (dataView, offset, data: number) => dataView.setUint8(offset, data),
)
export const uint16 = createByteView(
  ByteViewKind.Uint16,
  Model.number,
  2,
  (dataView, offset) => dataView.getUint16(offset),
  (dataView, offset, data: number) => dataView.setUint16(offset, data),
)
export const uint32 = createByteView(
  ByteViewKind.Uint32,
  Model.number,
  4,
  (dataView, offset) => dataView.getUint32(offset),
  (dataView, offset, data: number) => dataView.setUint32(offset, data),
)
export const int8 = createByteView(
  ByteViewKind.Int8,
  Model.number,
  1,
  (dataView, offset) => dataView.getInt8(offset),
  (dataView, offset, data: number) => dataView.setInt8(offset, data),
)
export const int16 = createByteView(
  ByteViewKind.Int16,
  Model.number,
  2,
  (dataView, offset) => dataView.getInt16(offset),
  (dataView, offset, data: number) => dataView.setInt16(offset, data),
)
export const int32 = createByteView(
  ByteViewKind.Int32,
  Model.number,
  4,
  (dataView, offset) => dataView.getInt32(offset),
  (dataView, offset, data: number) => dataView.setInt32(offset, data),
)
export const float32 = createByteView(
  ByteViewKind.Float32,
  Model.number,
  4,
  (dataView, offset) => dataView.getFloat32(offset),
  (dataView, offset, data: number) => dataView.setFloat32(offset, data),
)
export const float64 = createByteView(
  ByteViewKind.Float64,
  Model.number,
  8,
  (dataView, offset) => dataView.getFloat64(offset),
  (dataView, offset, data: number) => dataView.setFloat64(offset, data),
)
export const string8 = createByteView(
  ByteViewKind.String8,
  Model.string,
  1,
  (dataView, offset, length = 0) => {
    let value = ""
    for (let i = 0; i < length; i++) {
      const charCode = dataView.getUint8(offset)
      if (charCode === 0) {
        break
      }
      value += String.fromCharCode(charCode)
      offset++
    }
    return value
  },
  (dataView, offset, data: string) => {
    for (let j = 0; j < data.length; j++) {
      dataView.setUint8(offset, data[j].charCodeAt(0))
      offset++
    }
  },
)
export const string16 = createByteView(
  ByteViewKind.String16,
  Model.string,
  2,
  (dataView, offset, length = 0) => {
    let value = ""
    for (let i = 0; i < length; i++) {
      const charCode = dataView.getUint16(offset)
      if (charCode === 0) {
        break
      }
      value += String.fromCharCode(charCode)
      offset += string16.byteLength
    }
    return value
  },
  (dataView, offset, data: string) => {
    for (let j = 0; j < data.length; j++) {
      dataView.setUint16(offset, data[j].charCodeAt(0))
      offset += string16.byteLength
    }
  },
)

export const boolean = createByteView(
  ByteViewKind.Boolean,
  Model.boolean,
  uint8.byteLength,
  (dataView: DataView, offset: number) => !!uint8.read(dataView, offset),
  (dataView: DataView, offset: number, value: boolean) =>
    uint8.write(dataView, offset, +value),
)

export const number = float64
export const string = string16

export function fieldToByteView(field: Model.Field) {
  if (isByteView(field)) {
    return field
  }
  switch (field[$kind]) {
    case Model.FieldKind.Number:
    case Model.FieldKind.Dynamic:
      return number
    case Model.FieldKind.String:
      return string
    case Model.FieldKind.Boolean:
      return boolean
  }
  throw new Error(
    `Failed to find dataView: unsupported field "${field[$kind]}"`,
  )
}
