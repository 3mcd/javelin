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

  #check_bounds() {
    assert(this.#offset <= this.#length)
  }

  reset(u8: Uint8Array) {
    this.#buffer.reset(u8)
    this.#offset = u8.byteOffset
    this.#length = u8.byteLength + u8.byteOffset
  }

  read_u8() {
    let offset = this.#offset
    this.#offset += 1
    this.#check_bounds()
    return this.#buffer.dv.getUint8(offset)
  }

  read_u32() {
    let offset = this.#offset
    this.#offset += 4
    this.#check_bounds()
    return this.#buffer.dv.getUint32(offset, LE)
  }

  peek_u32(relative_offset: number) {
    return this.#buffer.dv.getUint32(
      this.#offset - relative_offset,
      LE,
    )
  }

  read_f32() {
    let offset = this.#offset
    this.#offset += 4
    this.#check_bounds()
    return this.#buffer.dv.getFloat32(offset, LE)
  }

  read_f64() {
    let offset = this.#offset
    this.#offset += 8
    this.#check_bounds()
    return this.#buffer.dv.getFloat64(offset, LE)
  }
}
