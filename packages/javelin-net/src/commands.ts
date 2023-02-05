import * as j from "@javelin/ecs"
import {Singleton} from "@javelin/ecs"
import {
  compileDecodeValue,
  compileEncodeValue,
  getBytesPerTypeValues,
} from "./encode.js"
import {NormalizedModel} from "./model.js"
import {makeMessage} from "./protocol.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

type EncodeCommand = <T>(command: T, stream: WriteStream) => void
type DecodeCommand = <T>(stream: ReadStream) => T

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
  encode(stream, world, commandType: Singleton, command: unknown) {
    let {localComponentsToIso} = world.getResource(NormalizedModel)
    let commandEncoder = CommandEncoder.getEncoder(commandType)
    let commandComponent = commandType.normalized.components[0]
    stream.grow(4 + 2 + commandEncoder.bytesPerValue)
    stream.writeU32(localComponentsToIso[commandComponent])
    commandEncoder.encode(command, stream)
  },
  decode(stream, world) {
    let {isoComponentsToLocal} = world.getResource(NormalizedModel)
    let commandComponent = isoComponentsToLocal[stream.readU32()]
    let commandType = j.type(commandComponent)
    let commandEncoder = CommandEncoder.getEncoder(commandType)
    let command = commandEncoder.decode(stream)
    return [commandType, command]
  },
})
