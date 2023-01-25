import {assert} from "@javelin/lib"

export const LE = true

let ceilLog_2 = (n: number) => {
  let v = n - 1
  let r = v > 0xffff ? 1 << 4 : 0
  v >>>= r
  let s = v > 0xff ? 1 << 3 : 0
  v >>>= s
  r |= s
  s = v > 0xf ? 1 << 2 : 0
  v >>>= s
  r |= s
  s = v > 0x3 ? 1 << 1 : 0
  v >>>= s
  r += s
  return (r | (v >> 1)) + 1
}

export class Buffer {
  static pool

  static {
    this.pool = [] as Buffer[][]
    for (let i = 0; i < 31; ++i) {
      this.pool[i] = []
    }
  }

  static alloc(size: number) {
    assert(size <= 0x40000000)
    size = Math.max(2, size | 0)
    let i = ceilLog_2(size)
    return this.pool[i].pop() ?? new Buffer(new ArrayBuffer(1 << i))
  }

  static free(buffer: Buffer) {
    if (buffer.u8.length > 0) {
      let i = ceilLog_2(buffer.u8.length)
      this.pool[i].push(buffer)
    }
  }

  ab
  u8
  dv

  constructor(ab: ArrayBuffer) {
    this.ab = ab
    this.u8 = new Uint8Array(ab)
    this.dv = new DataView(ab)
  }

  reset(u8: Uint8Array) {
    this.ab = u8.buffer
    this.u8 = u8
    this.dv = new DataView(u8.buffer)
  }
}
