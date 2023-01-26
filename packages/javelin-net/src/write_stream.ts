import {Buffer, LE} from "./buffer.js"

export class WriteStream {
  #buffer
  #offset
  #initialByteLength

  constructor(initialByteLength = 0) {
    this.#buffer = Buffer.alloc(initialByteLength)
    this.#offset = 0
    this.#initialByteLength = initialByteLength
  }

  get offset() {
    return this.#offset
  }

  bytes() {
    return this.#buffer.u8.length === this.#offset
      ? this.#buffer.u8
      : this.#buffer.u8.subarray(0, this.#offset)
  }

  reset() {
    Buffer.free(this.#buffer)
    this.#buffer = Buffer.alloc(this.#initialByteLength)
    this.#offset = 0
  }

  grow(byteLength: number) {
    let newSize = this.#offset + byteLength
    if (this.#buffer.u8.length < newSize) {
      let buffer = Buffer.alloc(newSize)
      buffer.u8.set(this.#buffer.u8)
      Buffer.free(this.#buffer)
      this.#buffer = buffer
    }
  }

  writeU8(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setUint8(this.#offset, n)
    this.#offset = offset + 1
    return offset
  }

  writeU16(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setUint16(this.#offset, n)
    this.#offset = offset + 2
    return offset
  }

  writeU16At(n: number, offset: number) {
    this.#buffer.dv.setUint16(offset, n)
  }

  writeU32(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setUint32(this.#offset, n, LE)
    this.#offset = offset + 4
    return offset
  }

  writeU32At(n: number, offset: number) {
    this.#buffer.dv.setUint32(offset, n, LE)
  }

  writeI8(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setInt8(this.#offset, n)
    this.#offset = offset + 1
    return offset
  }

  writeI16(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setInt16(this.#offset, n)
    this.#offset = offset + 2
    return offset
  }

  writeI16At(n: number, offset: number) {
    this.#buffer.dv.setInt16(offset, n)
  }

  writeI32(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setInt32(this.#offset, n, LE)
    this.#offset = offset + 4
    return offset
  }

  writeI32At(n: number, offset: number) {
    this.#buffer.dv.setInt32(offset, n, LE)
  }

  writeF32(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setFloat32(this.#offset, n, LE)
    this.#offset = offset + 4
    return offset
  }

  writeF64(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setFloat64(this.#offset, n, LE)
    this.#offset = offset + 8
    return offset
  }
}
