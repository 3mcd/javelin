import {World} from "@javelin/ecs"
import {expect} from "@javelin/lib"
import {ReadStream} from "./read_stream.js"
import {WriteStream} from "./write_stream.js"

export interface ProtocolMessageType<T> {
  encode(stream: WriteStream, world: World, message: T): void
  decode(stream: ReadStream, world: World, length: number): void
}

type T = {
  message_types: ProtocolMessageType<unknown>[]
  message_type_ids: Map<ProtocolMessageType<unknown>, number>
}

const ERR_INVALID_PROTOCOL_MESSAGE_TYPE = "unregistered message type"

export let encode = <Q>(
  t: T,
  world: World,
  stream: WriteStream,
  message_type: ProtocolMessageType<Q>,
  message: Q,
) => {
  let message_type_id = expect(
    t.message_type_ids.get(message_type),
    ERR_INVALID_PROTOCOL_MESSAGE_TYPE,
  )
  stream.grow(1 + 4)
  stream.writeU8(message_type_id)
  let message_length_offset = stream.writeU32(0)
  let message_start_offset = stream.offset
  message_type.encode(stream, world, message)
  let message_length = stream.offset - message_start_offset
  stream.writeU32At(message_length, message_length_offset)
}

export let decode = (t: T, world: World, stream: ReadStream) => {
  let bytes = stream.bytes()
  while (stream.offset < bytes.byteLength) {
    let message_type_id = stream.readU8()
    let message_type = expect(
      t.message_types[message_type_id],
      ERR_INVALID_PROTOCOL_MESSAGE_TYPE,
    )
    let message_length = stream.readU32()
    message_type.decode(stream, world, message_length)
  }
}

export let add_message_type = (
  t: T,
  message_type: ProtocolMessageType<unknown>,
) => {
  let message_type_id = t.message_types.push(message_type) - 1
  t.message_type_ids.set(message_type, message_type_id)
}

export let make = (): T => {
  return {
    message_types: [],
    message_type_ids: new Map(),
  }
}
