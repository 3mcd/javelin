export type View<T> = {
  name: string
  byteLength: number
  read(view: DataView, offset: number, length: number): T
  write(view: DataView, bytes: number, data: T): void
}

function view<T>(
  name: string,
  byteLength: number,
  read: (view: DataView, offset: number, length: number) => T,
  write: (view: DataView, offset: number, data: T) => void,
): View<T> {
  return {
    name,
    byteLength,
    read,
    write,
  }
}

export const uint8 = view(
  "uint8",
  1,
  (view, offset) => view.getUint8(offset),
  (view, offset, data: number) => view.setUint8(offset, data),
)
export const uint16 = view(
  "uint16",
  2,
  (view, offset) => view.getUint16(offset),
  (view, offset, data: number) => view.setUint16(offset, data),
)
export const uint32 = view(
  "uint32",
  4,
  (view, offset) => view.getUint32(offset),
  (view, offset, data: number) => view.setUint32(offset, data),
)
export const int8 = view(
  "int8",
  1,
  (view, offset) => view.getInt8(offset),
  (view, offset, data: number) => view.setInt8(offset, data),
)
export const int16 = view(
  "int16",
  2,
  (view, offset) => view.getInt16(offset),
  (view, offset, data: number) => view.setInt16(offset, data),
)
export const int32 = view(
  "int32",
  4,
  (view, offset) => view.getInt32(offset),
  (view, offset, data: number) => view.setInt32(offset, data),
)
export const float32 = view(
  "float32",
  4,
  (view, offset) => view.getFloat32(offset),
  (view, offset, data: number) => view.setFloat32(offset, data),
)
export const float64 = view(
  "float64",
  8,
  (view, offset) => view.getFloat64(offset),
  (view, offset, data: number) => view.setFloat64(offset, data),
)
export const string8 = view(
  "string8",
  1,
  (view, offset, length: number) => {
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
  "string16",
  1,
  (view, offset, length: number) => {
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

export const boolean = {
  name: "boolean",
  byteLength: uint8.byteLength,
  read(view: DataView, offset: number, length: number) {
    return !!uint8.read(view, offset, length)
  },
  write(view: DataView, offset: number, value: boolean) {
    return uint8.write(view, offset, +value)
  },
}
export const number = float64
export const string = string8
