import * as j from "@javelin/ecs"
import {Singleton} from "@javelin/ecs"
import {
  compileDecodeValue,
  compileEncodeValue,
  getBytesPerTypeValues,
} from "./encode.js"
import {NormalizedNetworkModel} from "./model.js"
import {CorrectedWorld, PredictedWorld} from "./prediction_resources.js"
import {makeMessage} from "./protocol.js"
import {CommandStage, ensureCommandBuffer} from "./resources.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

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
    commandTimestamp: number,
  ) {
    let {localComponentsToIso} = world.getResource(NormalizedNetworkModel)
    let commandEncoder = CommandEncoder.getEncoder(commandType)
    let commandComponent = commandType.normalized.components[0]
    stream.grow(4 + 4 + 2 + commandEncoder.bytesPerValue)
    stream.writeU32(commandTimestamp)
    stream.writeU32(localComponentsToIso[commandComponent])
    commandEncoder.encode(command, stream)
  },
  decode(stream, world, client) {
    let commandBuffers = world.getResource(CommandStage)
    let {isoComponentsToLocal} = world.getResource(NormalizedNetworkModel)
    let commandTimestamp = stream.readU32()
    let commandComponent = isoComponentsToLocal[stream.readU32()]
    let commandType = j.type(commandComponent)
    let commandBuffer = ensureCommandBuffer(commandBuffers, commandType)
    let commandEncoder = CommandEncoder.getEncoder(commandType)
    let command: AddressedCommand = commandEncoder.decode(stream)
    command.source = client
    let predictedWorld = world.tryGetResource(PredictedWorld)
    let correctedWorld = world.tryGetResource(CorrectedWorld)
    if (predictedWorld) {
      let commandStage = predictedWorld.getResource(CommandStage)
      ensureCommandBuffer(commandStage, commandType).insert(
        command,
        commandTimestamp,
      )
    }
    if (correctedWorld) {
      let commandStage = correctedWorld.getResource(CommandStage)
      ensureCommandBuffer(commandStage, commandType).insert(
        command,
        commandTimestamp,
      )
    }
    commandBuffer.insert(command, commandTimestamp)
  },
})
