import {assert} from "@javelin/lib"
import {Buffer, LE} from "./buffer.js"

export class ReadStream {
  #buffer
  #offset
  #length

  constructor(u8: Uint8Array) {
    this.#buffer = new Buffer(u8.buffer)
    this.#offset = u8.byteOffset
    this.#length = u8.byteLength + u8.byteOffset
  }

  get length() {
    return this.#length
  }

  get offset() {
    return this.#offset
  }

  into(length = this.#length) {
    let next = new ReadStream(
      this.#buffer.u8.subarray(this.#offset, this.#offset + length),
    )
    this.#offset += length
    return next
  }

  bytes() {
    return this.#buffer.u8.subarray(this.#offset, this.#length)
  }

  #checkBounds() {
    assert(this.#offset <= this.#length)
  }

  reset(u8: Uint8Array) {
    this.#buffer.reset(u8)
    this.#offset = u8.byteOffset
    this.#length = u8.byteLength + u8.byteOffset
  }

  readU8() {
    let offset = this.#offset
    this.#offset += 1
    this.#checkBounds()
    return this.#buffer.dv.getUint8(offset)
  }

  readU16() {
    let offset = this.#offset
    this.#offset += 2
    this.#checkBounds()
    return this.#buffer.dv.getUint16(offset)
  }

  readU32() {
    let offset = this.#offset
    this.#offset += 4
    this.#checkBounds()
    return this.#buffer.dv.getUint32(offset, LE)
  }

  readI8() {
    let offset = this.#offset
    this.#offset += 1
    this.#checkBounds()
    return this.#buffer.dv.getInt8(offset)
  }

  readI16() {
    let offset = this.#offset
    this.#offset += 2
    this.#checkBounds()
    return this.#buffer.dv.getInt16(offset)
  }

  readI32() {
    let offset = this.#offset
    this.#offset += 4
    this.#checkBounds()
    return this.#buffer.dv.getInt32(offset, LE)
  }

  peekU32(relativeOffset = 0) {
    return this.#buffer.dv.getUint32(this.#offset - relativeOffset, LE)
  }

  peekF64(relativeOffset = 0) {
    return this.#buffer.dv.getFloat64(this.#offset - relativeOffset, LE)
  }

  readF32() {
    let offset = this.#offset
    this.#offset += 4
    this.#checkBounds()
    return this.#buffer.dv.getFloat32(offset, LE)
  }

  readF64() {
    let offset = this.#offset
    this.#offset += 8
    this.#checkBounds()
    return this.#buffer.dv.getFloat64(offset, LE)
  }
}

export class WriteStream {
  #buffer
  #offset
  #initialLength

  constructor(initialLength = 0) {
    this.#buffer = Buffer.alloc(initialLength)
    this.#offset = 0
    this.#initialLength = initialLength
  }

  get offset() {
    return this.#offset
  }

  bytes() {
    return this.#buffer.u8.length === this.#offset
      ? this.#buffer.u8
      : this.#buffer.u8.subarray(
          this.#buffer.u8.byteOffset,
          this.#buffer.u8.byteOffset + this.#offset,
        )
  }

  reset() {
    Buffer.free(this.#buffer)
    this.#buffer = Buffer.alloc(this.#initialLength)
    this.#offset = 0
  }

  destroy() {
    Buffer.free(this.#buffer)
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

  shrink(byteLength: number) {
    this.#offset = Math.max(0, this.#offset - byteLength)
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

export let makeWriteStream = (initialLength: number = 0) =>
  new WriteStream(initialLength)
export let makeReadStream = (u8: Uint8Array) => new ReadStream(u8)
