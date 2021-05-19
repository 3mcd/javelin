import { uint32, uint8 } from "@javelin/pack"
import { Message, MessagePart } from "./message"
import { $buffer } from "./message_op"

function encodePart(
  dataView: DataView,
  part: MessagePart,
  offset: number,
): number {
  uint8.write(dataView, offset, part.kind)
  offset += uint8.byteLength
  uint32.write(dataView, offset, part.byteLength)
  offset += uint32.byteLength
  for (let i = 0; i < part.ops.length; i++) {
    const { data, view } = part.ops[i]
    for (let j = 0; j < data.length; j++) {
      const d = data[j]
      const v = view[j]
      if (v === $buffer) {
        const byteLength = (d as ArrayBuffer).byteLength
        new Uint8Array(dataView.buffer, 0, dataView.buffer.byteLength).set(
          new Uint8Array(d as ArrayBuffer),
          offset,
        )
        offset += byteLength
      } else {
        v.write(dataView, offset, d)
        offset += v.byteLength
      }
    }
  }
  return offset
}

export function encode(message: Message): ArrayBuffer {
  const buffer = new ArrayBuffer(message.byteLength)
  const view = new DataView(buffer)
  let offset = 0
  message.parts.forEach(part => {
    offset = encodePart(view, part, offset)
  })
  return buffer
}
