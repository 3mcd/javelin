import {World} from "@javelin/ecs"
import {expect} from "@javelin/lib"
import {ReadStream, WriteStream} from "./stream.js"

export interface IProtocol {
  encode<T>(
    world: World,
    stream: WriteStream,
    messageType: ProtocolMessageType<T>,
    message: T,
  ): void
  decode(world: World, stream: ReadStream): void
  addMessageType(messageType: ProtocolMessageType<unknown>): IProtocol
}

export interface ProtocolMessageType<T> {
  encode(stream: WriteStream, world: World, message: T): void
  decode(stream: ReadStream, world: World, length: number): void
}

const ERR_INVALID_PROTOCOL_MESSAGE_TYPE = "invalid message type"

class ProtocolBuilder implements IProtocol {
  #messageTypes: ProtocolMessageType<unknown>[]
  #messageTypeIds: Map<ProtocolMessageType<unknown>, number>

  constructor() {
    this.#messageTypes = [] as ProtocolMessageType<unknown>[]
    this.#messageTypeIds = new Map<ProtocolMessageType<unknown>, number>()
  }

  encode<T>(
    world: World,
    stream: WriteStream,
    messageType: ProtocolMessageType<T>,
    message: T,
  ) {
    let messageTypeId = expect(
      this.#messageTypeIds.get(messageType),
      ERR_INVALID_PROTOCOL_MESSAGE_TYPE,
    )
    stream.grow(1 + 4)
    stream.writeU8(messageTypeId)
    let messageLengthOffset = stream.writeU32(0)
    let messageStartOffset = stream.offset
    messageType.encode(stream, world, message)
    let messageLength = stream.offset - messageStartOffset
    stream.writeU32At(messageLength, messageLengthOffset)
  }

  decode(world: World, stream: ReadStream) {
    let bytes = stream.bytes()
    while (stream.offset < bytes.byteLength) {
      let messageTypeId = stream.readU8()
      let messageType = expect(
        this.#messageTypes[messageTypeId],
        ERR_INVALID_PROTOCOL_MESSAGE_TYPE,
      )
      let messageLength = stream.readU32()
      messageType.decode(stream, world, messageLength)
    }
  }

  addMessageType(messageType: ProtocolMessageType<unknown>) {
    let messageTypeId = this.#messageTypes.push(messageType) - 1
    this.#messageTypeIds.set(messageType, messageTypeId)
    return this
  }
}

export let makeProtocol = () => new ProtocolBuilder()
