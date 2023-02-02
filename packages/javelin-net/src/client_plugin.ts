import * as j from "@javelin/ecs"
import {exists, expect, Maybe} from "@javelin/lib"
import {ClockSyncImpl, clockSyncMessageType} from "./clock_sync.js"
import {commandsMessageType} from "./commands.js"
import {ClockSyncPayload, Transport} from "./components.js"
import {
  NetworkModel,
  NormalizedNetworkModel,
  normalizeNetworkModel,
} from "./network_model.js"
import {makeProtocol} from "./protocol.js"
import {NetworkProtocol} from "./resources.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

export let ServerWorld = j.resource<j.World>()
export let ServerTime = j.resource<number>()
export let ClockSync = j.resource<ClockSyncImpl>()
export let ClockSyncRequestInterval = j.resource<number>()
export let ClockSyncRequestTime = j.resource<number>()

let writeStreamReliable = new WriteStream()
let readStream = new ReadStream(new Uint8Array())

let processClientMessagesSystem = (world: j.World) => {
  let protocol = world.getResource(NetworkProtocol)
  let serverWorld = world.getResource(ServerWorld)
  world.of(Transport).each(function processClientMessages(client, transport) {
    let message: Maybe<Uint8Array>
    while (exists((message = transport.pull()))) {
      readStream.reset(message)
      protocol.decodeMessage(serverWorld, readStream, client)
    }
  })
  serverWorld[j._emitStagedChanges]()
  serverWorld[j._commitStagedChanges]()
}

let processClientClockSyncResponsesSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let clockSync = world.getResource(ClockSync)
  let serverWorld = world.getResource(ServerWorld)
  serverWorld.of(ClockSyncPayload).each((_, clockSyncPayload) => {
    if (clockSyncPayload.serverTime > 0) {
      clockSync.addSample(
        clockSyncPayload.serverTime -
          (clockSyncPayload.clientTime + time.currentTime) / 2,
      )
      clockSyncPayload.serverTime = 0
    }
  })
}

let controlFixedTimestepSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let serverWorld = world.getResource(ServerWorld)
  let serverOffset = world.getResource(ClockSync).getMeanOffset()
  if (serverOffset < Infinity) {
    let serverTime = time.currentTime + serverOffset + 0.3
    serverWorld.setResource(ServerTime, serverTime)
    world.setResource(j.FixedTimestepTargetTime, serverTime)
  }
}

let clockSyncPayload = {
  clientTime: 0,
  serverTime: 0,
}

let sendClientClockSyncRequestsSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let protocol = world.getResource(NetworkProtocol)
  world.of(Transport).each(function sendClientClockSyncRequest(_, transport) {
    clockSyncPayload.clientTime = time.currentTime
    protocol.encodeMessage(
      world,
      writeStreamReliable,
      clockSyncMessageType,
      clockSyncPayload,
    )
    transport.push(writeStreamReliable.bytes(), true)
    writeStreamReliable.reset()
  })
  world.setResource(ClockSyncRequestTime, time.currentTime)
}

let sendClientCommandsSystem = (world: j.World) => {
  let serverWorld = world.getResource(ServerWorld)
  let networkProtocol = world.getResource(NetworkProtocol)
  let networkModel = serverWorld.getResource(NormalizedNetworkModel)
  let commandTypes = networkModel.localCommands
  world.of(Transport).each((_, transport) => {
    for (let i = 0; i < commandTypes.length; i++) {
      let commandType = commandTypes[i]
      if (serverWorld.commands(commandType).length > 0) {
        networkProtocol.encodeMessage(
          serverWorld,
          writeStreamReliable,
          commandsMessageType,
          commandType,
        )
      }
    }
    let bytes = writeStreamReliable.bytes()
    if (bytes.length > 0) {
      transport.push(bytes, true)
      writeStreamReliable.reset()
    }
  })
}

let drainServerWorldCommandsSystem = (world: j.World) => {
  world.getResource(ServerWorld)[j._drainCommands]()
}

export let clientPlugin = (app: j.App) => {
  let clockSync = new ClockSyncImpl({
    expectedOutlierRate: 0.2,
    maxDeviation: 0.1,
    requiredSampleCount: 8,
  })
  let protocol = app.getResource(NetworkProtocol)
  if (!exists(protocol)) {
    protocol = makeProtocol()
    app.addResource(NetworkProtocol, protocol)
  }
  if (!app.hasResource(ServerWorld)) {
    let serverWorld = new j.World()
    serverWorld.create(ClockSyncPayload)
    serverWorld[j._emitStagedChanges]()
    serverWorld[j._commitStagedChanges]()
    app.addResource(ServerWorld, serverWorld)
    serverWorld.setResource(
      NormalizedNetworkModel,
      normalizeNetworkModel(expect(app.getResource(NetworkModel))),
    )
    serverWorld.setResource(ServerTime, 0)
  }
  if (!app.hasResource(ClockSyncRequestInterval)) {
    app.addResource(ClockSyncRequestInterval, 0.2)
  }
  app
    .addResource(ClockSync, clockSync)
    .addResource(ClockSyncRequestTime, 0)
    .addSystemToGroup(j.Group.Early, processClientMessagesSystem)
    .addSystemToGroup(j.Group.Early, processClientClockSyncResponsesSystem)
    .addSystemToGroup(
      j.Group.Early,
      sendClientClockSyncRequestsSystem,
      null,
      world => {
        let time = world.getResource(j.Time)
        let clockSyncRequestTime = world.getResource(ClockSyncRequestTime)
        let clockSyncRequestInterval = world.getResource(
          ClockSyncRequestInterval,
        )
        return (
          time.currentTime > clockSyncRequestTime + clockSyncRequestInterval
        )
      },
    )
    .addSystemToGroup(
      j.Group.Early,
      controlFixedTimestepSystem,
      j.before(j.advanceFixedTimestepSystem),
    )
    .addSystemToGroup(j.Group.Late, sendClientCommandsSystem)
    .addSystemToGroup(
      j.Group.Late,
      drainServerWorldCommandsSystem,
      j.after(sendClientCommandsSystem),
    )
}
