import {Entity, World} from "@javelin/ecs"
import {expect} from "@javelin/lib"
import {clockSyncMessageType} from "./clock_sync.js"
import {commandsMessageType} from "./commands.js"
import {interestMessageType} from "./interest.js"
import {presenceMessageType} from "./presence.js"
import {snapshotInterestMessageType} from "./snapshot_interest.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

export interface NetworkProtocol {
  encodeMessage<T>(
    world: World,
    writeStream: WriteStream,
    messageType: NetworkMessageType<T>,
    message: T,
  ): void
  decodeMessage(world: World, readStream: ReadStream, client: Entity): void
  addMessageType(messageType: NetworkMessageType<unknown>): NetworkProtocol
}

export interface NetworkMessageType<T> {
  encode(writeStream: WriteStream, world: World, message: T): void
  decode(
    readStream: ReadStream,
    world: World,
    entity: Entity,
    length: number,
  ): void
}

const ERR_INVALID_PROTOCOL_MESSAGE_TYPE = "invalid message type"

class NetworkProtocolImpl implements NetworkProtocol {
  #messageTypes: NetworkMessageType<unknown>[]
  #messageTypeIds: Map<NetworkMessageType<unknown>, number>

  private static BASE_BYTE_LENGTH = 5

  constructor(...messageTypes: NetworkMessageType<unknown>[]) {
    this.#messageTypes = []
    this.#messageTypeIds = new Map<NetworkMessageType<unknown>, number>()
    for (let i = 0; i < messageTypes.length; i++) {
      let messageType = messageTypes[i]
      this.addMessageType(messageType)
    }
  }

  encodeMessage<T>(
    world: World,
    writeStream: WriteStream,
    messageType: NetworkMessageType<T>,
    message: T,
  ) {
    let messageTypeId = expect(
      this.#messageTypeIds.get(messageType),
      ERR_INVALID_PROTOCOL_MESSAGE_TYPE,
    )
    writeStream.grow(NetworkProtocolImpl.BASE_BYTE_LENGTH)
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
    while (readStream.offset < readStream.length) {
      let messageTypeId = readStream.readU8()
      let messageType = expect(
        this.#messageTypes[messageTypeId],
        ERR_INVALID_PROTOCOL_MESSAGE_TYPE,
      )
      let messageLength = readStream.readU32()
      messageType.decode(readStream, world, entity, messageLength)
    }
  }

  addMessageType(messageType: NetworkMessageType<unknown>) {
    let messageTypeId = this.#messageTypes.push(messageType) - 1
    this.#messageTypeIds.set(messageType, messageTypeId)
    return this
  }
}

export let makeProtocol = (): NetworkProtocol =>
  new NetworkProtocolImpl(
    clockSyncMessageType,
    commandsMessageType,
    interestMessageType,
    presenceMessageType,
    snapshotInterestMessageType,
  )
