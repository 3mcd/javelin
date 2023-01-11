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

  get offset() {
    return this.#offset
  }

  get bytes() {
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

  readU32() {
    let offset = this.#offset
    this.#offset += 4
    this.#checkBounds()
    return this.#buffer.dv.getUint32(offset, LE)
  }

  peekU32(relativeOffset: number) {
    return this.#buffer.dv.getUint32(
      this.#offset - relativeOffset,
      LE,
    )
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
