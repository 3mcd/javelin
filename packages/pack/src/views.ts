import * as model from "@javelin/model"
import { DataType } from "@javelin/model"

export enum ViewType {
  Uint8 = "uint8",
  Uint16 = "uint16",
  Uint32 = "uint32",
  Int8 = "int8",
  Int16 = "int16",
  Int32 = "int32",
  Float32 = "float32",
  Float64 = "float64",
  String8 = "string8",
  String16 = "string16",
  Boolean = "boolean",
}

export const isView = (
  dataType: DataType<unknown>,
): dataType is View<unknown> => {
  return "byteLength" in dataType
}

export type View<T = any> = model.DataType<T> & {
  byteLength: number
  read(view: DataView, offset: number, length?: number): T
  write(view: DataView, offset: number, data: T): void
}

function view<T>(
  dataTypeId: string,
  dataTypeBase: model.DataType,
  byteLength: number,
  read: (view: DataView, offset: number, length?: number) => T,
  write: (view: DataView, offset: number, data: T) => void,
): View<T> {
  return {
    byteLength,
    read,
    write,
    ...dataTypeBase,
    __type__: dataTypeId,
  }
}

export const uint8 = view(
  ViewType.Uint8,
  model.number,
  1,
  (view, offset) => view.getUint8(offset),
  (view, offset, data: number) => view.setUint8(offset, data),
)
export const uint16 = view(
  ViewType.Uint16,
  model.number,
  2,
  (view, offset) => view.getUint16(offset),
  (view, offset, data: number) => view.setUint16(offset, data),
)
export const uint32 = view(
  ViewType.Uint32,
  model.number,
  4,
  (view, offset) => view.getUint32(offset),
  (view, offset, data: number) => view.setUint32(offset, data),
)
export const int8 = view(
  ViewType.Int8,
  model.number,
  1,
  (view, offset) => view.getInt8(offset),
  (view, offset, data: number) => view.setInt8(offset, data),
)
export const int16 = view(
  ViewType.Int16,
  model.number,
  2,
  (view, offset) => view.getInt16(offset),
  (view, offset, data: number) => view.setInt16(offset, data),
)
export const int32 = view(
  ViewType.Int32,
  model.number,
  4,
  (view, offset) => view.getInt32(offset),
  (view, offset, data: number) => view.setInt32(offset, data),
)
export const float32 = view(
  ViewType.Float32,
  model.number,
  4,
  (view, offset) => view.getFloat32(offset),
  (view, offset, data: number) => view.setFloat32(offset, data),
)
export const float64 = view(
  ViewType.Float64,
  model.number,
  8,
  (view, offset) => view.getFloat64(offset),
  (view, offset, data: number) => view.setFloat64(offset, data),
)
export const string8 = view(
  ViewType.String8,
  model.string,
  1,
  (view, offset, length = 0) => {
    let value = ""

    for (let i = 0; i < length; i++) {
      const charCode = view.getUint8(offset)

      if (charCode === 0) {
        break
      }

      value += String.fromCharCode(charCode)
      offset++
    }

    return value
  },
  (view, offset, data: string) => {
    for (let j = 0; j < data.length; j++) {
      view.setUint8(offset, data[j].charCodeAt(0))
      offset++
    }
  },
)
export const string16 = view(
  ViewType.String16,
  model.string,
  1,
  (view, offset, length = 0) => {
    let value = ""

    for (let i = 0; i < length; i++) {
      const charCode = view.getUint16(offset)

      if (charCode === 0) {
        break
      }

      value += String.fromCharCode(charCode)
      offset++
    }

    return value
  },
  (view, offset, data: string) => {
    for (let j = 0; j < data.length; j++) {
      view.setUint16(offset, data[j].charCodeAt(0))
      offset++
    }
  },
)

export const boolean = view(
  ViewType.Boolean,
  model.boolean,
  uint8.byteLength,
  (view: DataView, offset: number) => !!uint8.read(view, offset, length),
  (view: DataView, offset: number, value: boolean) =>
    uint8.write(view, offset, +value),
)

export const number = float64
export const string = string8

export const dataTypeToView = (dataType: model.DataType) => {
  if ("byteLength" in dataType) {
    return dataType as View
  }
  switch (dataType) {
    case model.number:
      return number
    case model.string:
      return string
    case model.boolean:
      return boolean
  }
  throw new Error(
    `Failed to find view: unsupported DataType "${dataType.__type__}"`,
  )
}
