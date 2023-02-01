import {Entity, World} from "@javelin/ecs"
import {expect} from "@javelin/lib"
import {clockSyncMessageType} from "./clock_sync.js"
import {interestMessageType} from "./interest.js"
import {presenceMessageType} from "./presence.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

export interface IProtocol {
  encodeMessage<T>(
    world: World,
    writeStream: WriteStream,
    messageType: ProtocolMessageType<T>,
    message: T,
  ): void
  decodeMessage(world: World, readStream: ReadStream, client: Entity): void
  addMessageType(messageType: ProtocolMessageType<unknown>): IProtocol
}

export interface ProtocolMessageType<T> {
  encode(writeStream: WriteStream, world: World, message: T): void
  decode(
    readStream: ReadStream,
    world: World,
    entity: Entity,
    length: number,
  ): void
}

const ERR_INVALID_PROTOCOL_MESSAGE_TYPE = "invalid message type"

class ProtocolBuilder implements IProtocol {
  #messageTypes: ProtocolMessageType<unknown>[]
  #messageTypeIds: Map<ProtocolMessageType<unknown>, number>

  private static BASE_BYTE_LENGTH = 5

  constructor() {
    this.#messageTypes = [] as ProtocolMessageType<unknown>[]
    this.#messageTypeIds = new Map<ProtocolMessageType<unknown>, number>()
  }

  encodeMessage<T>(
    world: World,
    writeStream: WriteStream,
    messageType: ProtocolMessageType<T>,
    message: T,
  ) {
    let messageTypeId = expect(
      this.#messageTypeIds.get(messageType),
      ERR_INVALID_PROTOCOL_MESSAGE_TYPE,
    )
    writeStream.grow(ProtocolBuilder.BASE_BYTE_LENGTH)
    writeStream.writeU8(messageTypeId)
    let messageLengthOffset = writeStream.writeU32(0)
    let messageStartOffset = writeStream.offset
    messageType.encode(writeStream, world, message)
    let messageLength = writeStream.offset - messageStartOffset
    if (messageLength === 0) {
      writeStream.reset()
    } else {
      writeStream.writeU32At(messageLength, messageLengthOffset)
    }
  }

  decodeMessage(world: World, readStream: ReadStream, entity: Entity) {
    let bytes = readStream.bytes()
    while (readStream.offset < bytes.byteLength) {
      let messageTypeId = readStream.readU8()
      let messageType = expect(
        this.#messageTypes[messageTypeId],
        ERR_INVALID_PROTOCOL_MESSAGE_TYPE,
      )
      let messageLength = readStream.readU32()
      messageType.decode(readStream, world, entity, messageLength)
    }
  }

  addMessageType(messageType: ProtocolMessageType<unknown>) {
    let messageTypeId = this.#messageTypes.push(messageType) - 1
    this.#messageTypeIds.set(messageType, messageTypeId)
    return this
  }
}

export let makeProtocol = () =>
  new ProtocolBuilder()
    .addMessageType(presenceMessageType)
    .addMessageType(interestMessageType)
    .addMessageType(clockSyncMessageType)
