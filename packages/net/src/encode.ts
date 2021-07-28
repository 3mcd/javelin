import * as Pack from "@javelin/pack"
import { Cursor } from "@javelin/pack"
import { Message, MessagePart } from "./message"
import { $buffer } from "./message_op"

function encodePart(dataView: DataView, part: MessagePart, cursor: Cursor) {
  Pack.write(dataView, Pack.uint8, cursor, part.kind)
  Pack.write(dataView, Pack.uint32, cursor, part.byteLength)
  for (let i = 0; i < part.ops.length; i++) {
    const { data, view } = part.ops[i]
    for (let j = 0; j < data.length; j++) {
      const dataElement = data[j]
      const viewElement = view[j]
      if (viewElement === $buffer) {
        const byteLength = (dataElement as ArrayBuffer).byteLength
        new Uint8Array(dataView.buffer, 0, dataView.buffer.byteLength).set(
          new Uint8Array(dataElement as ArrayBuffer),
          cursor.offset,
        )
        cursor.offset += byteLength
      } else {
        Pack.write(
          dataView,
          viewElement,
          cursor,
          dataElement as string | number | boolean,
        )
      }
    }
  }
}

export function encode(message: Message): ArrayBuffer {
  const buffer = new ArrayBuffer(message.byteLength)
  const view = new DataView(buffer)
  const cursor = { offset: 0 }
  // message.parts is sparse so we use forEach to skip empty elements
  message.parts.forEach(part => encodePart(view, part, cursor))
  return buffer
}
