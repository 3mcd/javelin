import * as j from "@javelin/ecs"
import {Singleton} from "@javelin/ecs"
import {exists, expect} from "@javelin/lib"
import {Commands} from "./components.js"
import {EntityEncoder} from "./encode.js"
import {NormalizedNetworkModel} from "./network_model.js"
import {NetworkMessageType} from "./protocol.js"

export let commandsMessageType: NetworkMessageType<Singleton> = {
  encode(writeStream, world, commandType) {
    let {localComponentsToIso} = world.getResource(NormalizedNetworkModel)
    let commandEncoder = EntityEncoder.getEntityEncoder(world, commandType)
    let commandComponent = commandType.normalized.components[0]
    let commands = world.commands(commandType)
    writeStream.grow(4 + 2 + commands.length * commandEncoder.bytesPerValues)
    // (1)
    writeStream.writeU32(localComponentsToIso[commandComponent])
    // (2)
    writeStream.writeU16(commands.length)
    // (3)
    commandEncoder.encodeValues(commands, writeStream)
  },
  decode(readStream, world, entity) {
    let {isoComponentsToLocal} = world.getResource(NormalizedNetworkModel)
    // (1)
    let commandComponent = isoComponentsToLocal[readStream.readU32()]
    let commandType = j.type(commandComponent)
    let commandEncoder = EntityEncoder.getEntityEncoder(world, commandType)
    // (2)
    let commandCount = readStream.readU16()
    let entityCommands = expect(world.get(entity, Commands))
    let entityCommandQueue = entityCommands.get(commandComponent)
    if (!exists(entityCommandQueue)) {
      entityCommandQueue = []
      entityCommands.set(commandComponent, entityCommandQueue)
    }
    // (3)
    commandEncoder.decodeValues(entityCommandQueue, readStream, commandCount)
  },
}
