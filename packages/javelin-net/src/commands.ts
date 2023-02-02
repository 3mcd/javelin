import * as j from "@javelin/ecs"
import {Singleton} from "@javelin/ecs"
import {exists, expect} from "@javelin/lib"
import {Commands} from "./components.js"
import {
  compileDecodeValue,
  compileEncodeValue,
  getBytesPerTypeValues,
} from "./encode.js"
import {NormalizedNetworkModel} from "./network_model.js"
import {NetworkMessageType} from "./protocol.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

type EncodeCommand = <T>(command: T, writeStream: WriteStream) => void
type DecodeCommand = <T>(readStream: ReadStream) => T

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

export let commandsMessageType: NetworkMessageType<Singleton> = {
  encode(writeStream, world, commandType) {
    let {localComponentsToIso} = world.getResource(NormalizedNetworkModel)
    let commandEncoder = CommandEncoder.getEncoder(commandType)
    let commandComponent = commandType.normalized.components[0]
    let commandQueue = world.commands(commandType)
    let commandCount = commandQueue.length
    writeStream.grow(4 + 2 + commandCount * commandEncoder.bytesPerValue)
    // (1)
    writeStream.writeU32(localComponentsToIso[commandComponent])
    // (2)
    writeStream.writeU16(commandCount)
    // (3)
    for (let i = commandCount - 1; i >= 0; i--) {
      commandEncoder.encode(commandQueue[i], writeStream)
    }
  },
  decode(readStream, world, entity) {
    let {isoComponentsToLocal} = world.getResource(NormalizedNetworkModel)
    // (1)
    let commandComponent = isoComponentsToLocal[readStream.readU32()]
    let commandType = j.type(commandComponent)
    let commandEncoder = CommandEncoder.getEncoder(commandType)
    // (2)
    let commandCount = readStream.readU16()
    let commandQueues = expect(world.get(entity, Commands))
    let commandQueue = commandQueues.get(commandComponent)
    if (!exists(commandQueue)) {
      commandQueue = []
      commandQueues.set(commandComponent, commandQueue)
    }
    // (3)
    while (commandCount-- > 0) {
      commandQueue.unshift(commandEncoder.decode(readStream))
    }
  },
}
