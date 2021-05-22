import { uint32, uint8 } from "@javelin/pack"
import { encode } from "./encode"
import * as Message from "./message"
import * as MessageOp from "./message_op"

const PART_HEADER_LENGTH = uint8.byteLength + uint32.byteLength

describe("encode", () => {
  it("has 0 bytes of overhead", () => {
    const message = Message.createMessage()
    expect(encode(message).byteLength).toBe(0)
  })
  it("skips empty ops", () => {
    const message = Message.createMessage()
    const op = MessageOp.createOp()
    Message.insert(message, 0, op)
    expect(encode(message).byteLength).toBe(0)
  })
  it("encodes message parts with (kind + length) bytes of overhead", () => {
    const message = Message.createMessage()
    const kind = 0
    const data = 99
    const op = MessageOp.createOp()
    MessageOp.insert(op, data, uint8)
    Message.insert(message, kind, op)
    const encoded = encode(message)
    const dataView = new DataView(encoded)
    expect(dataView.getUint8(0)).toBe(kind)
    expect(dataView.getUint32(1)).toBe(uint8.byteLength)
    expect(dataView.getUint8(5)).toBe(data)
    expect(encoded.byteLength).toBe(PART_HEADER_LENGTH + uint8.byteLength)
  })
  it("encodes multiple parts ordered by kind", () => {
    const message = Message.createMessage()
    const data1 = 98
    const data2 = 99
    const kind1 = 3
    const kind2 = 7
    const op1 = MessageOp.createOp()
    const op2 = MessageOp.createOp()
    // kind 7
    MessageOp.insert(op2, data2, uint8)
    Message.insert(message, kind2, op2)
    // kind 3
    MessageOp.insert(op1, data1, uint8)
    Message.insert(message, kind1, op1)
    const encoded = encode(message)
    const dataView = new DataView(encoded)
    expect(dataView.getUint8(0)).toBe(kind1)
    expect(dataView.getUint32(1)).toBe(uint8.byteLength)
    expect(dataView.getUint8(5)).toBe(data1)
    expect(dataView.getUint8(6)).toBe(kind2)
    expect(dataView.getUint32(7)).toBe(uint8.byteLength)
    expect(dataView.getUint8(11)).toBe(data2)
    expect(encoded.byteLength).toBe((PART_HEADER_LENGTH + uint8.byteLength) * 2)
  })
  it("encodes arraybuffers", () => {
    const message = Message.createMessage()
    const op = MessageOp.createOp()
    const array = new Uint8Array([1, 2])
    MessageOp.insert(op, array.buffer)
    Message.insert(message, 0, op)
    const encoded = encode(message)
    const dataView = new DataView(encoded)
    expect(dataView.getUint32(1)).toBe(array.byteLength)
    expect(String(new Uint8Array(encoded.slice(5)))).toBe(String(array))
  })
})
