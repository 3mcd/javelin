import {Buffer, LE} from "./buffer.js"

export class WriteStream {
  #buffer
  #offset
  #initial_capacity

  constructor(initial_capacity = 0) {
    this.#buffer = Buffer.alloc(initial_capacity)
    this.#offset = 0
    this.#initial_capacity = initial_capacity
  }

  get offset() {
    return this.#offset
  }

  get bytes() {
    return this.#buffer.u8.length === this.#offset
      ? this.#buffer.u8
      : this.#buffer.u8.subarray(0, this.#offset)
  }

  reset() {
    Buffer.free(this.#buffer)
    this.#buffer = Buffer.alloc(this.#initial_capacity)
    this.#offset = 0
  }

  grow(grow_amount: number) {
    let new_size = this.#offset + grow_amount
    if (this.#buffer.u8.length < new_size) {
      let buffer = Buffer.alloc(new_size)
      buffer.u8.set(this.#buffer.u8)
      Buffer.free(this.#buffer)
      this.#buffer = buffer
    }
  }

  write_u8(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setUint8(this.#offset, n)
    this.#offset = offset + 1
    return offset
  }

  write_u32(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setUint32(this.#offset, n, LE)
    this.#offset = offset + 4
    return offset
  }

  write_u32_at(n: number, offset: number) {
    this.#buffer.dv.setUint32(offset, n, LE)
  }

  write_f32(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setFloat32(this.#offset, n, LE)
    this.#offset = offset + 4
    return offset
  }

  write_f64(n: number) {
    let offset = this.#offset
    this.#buffer.dv.setFloat64(this.#offset, n, LE)
    this.#offset = offset + 8
    return offset
  }
}
