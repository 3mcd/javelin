import * as j from "@javelin/ecs"
import {Singleton} from "@javelin/ecs"
import {
  compileDecodeValue,
  compileEncodeValue,
  getBytesPerTypeValues,
} from "./encode.js"
import {NormalizedNetworkModel} from "./model.js"
import {makeMessage} from "./protocol.js"
import {CommandStage, ensureCommandBuffer} from "./resources.js"
import {ReadStream, WriteStream} from "./structs/stream.js"
import {Timestamp} from "./timestamp.js"

type EncodeCommand = <T>(command: T, stream: WriteStream) => void
type DecodeCommand = <T>(stream: ReadStream) => T

export type AddressedCommand = {
  source: j.Entity
}

class CommandEncoder {
  static #encoders = [] as CommandEncoder[]

  readonly encode
  readonly decode
  readonly bytesPerValue

  static getEncoder(commandType: Singleton) {
    return (this.#encoders[commandType.hash] ??= new CommandEncoder(
      commandType,
    ))
  }

  constructor(commandType: Singleton) {
    this.encode = compileEncodeValue(commandType) as EncodeCommand
    this.decode = compileDecodeValue(commandType) as DecodeCommand
    this.bytesPerValue = getBytesPerTypeValues(commandType)
  }
}

export let commandMessage = makeMessage({
  encode(
    stream,
    world,
    commandType: Singleton,
    command: unknown,
    commandTimestamp: Timestamp,
  ) {
    let {localComponentsToIso} = world.getResource(NormalizedNetworkModel)
    let commandEncoder = CommandEncoder.getEncoder(commandType)
    let commandComponent = commandType.normalized.components[0]
    stream.grow(2 + 4 + 2 + commandEncoder.bytesPerValue)
    stream.writeI16(commandTimestamp)
    stream.writeU32(localComponentsToIso[commandComponent])
    commandEncoder.encode(command, stream)
  },
  decode(stream, world, client) {
    let commandBuffers = world.getResource(CommandStage)
    let {isoComponentsToLocal} = world.getResource(NormalizedNetworkModel)
    let commandTimestamp = stream.readI16()
    let commandComponent = isoComponentsToLocal[stream.readU32()]
    let commandType = j.type(commandComponent)
    let commandBuffer = ensureCommandBuffer(commandBuffers, commandType)
    let commandEncoder = CommandEncoder.getEncoder(commandType)
    let command: AddressedCommand = commandEncoder.decode(stream)
    command.source = client
    console.log(command)
    commandBuffer.insert(command, commandTimestamp as Timestamp)
  },
})
