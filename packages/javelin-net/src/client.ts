import * as j from "@javelin/ecs"
import {exists, Maybe} from "@javelin/lib"
import {
  ClockSync,
  ClockSyncRequestInterval,
  ClockSyncRequestTime,
  ServerWorld,
} from "./client_resources.js"
import {ClockSyncImpl, clockSyncMessage} from "./clock_sync.js"
import {commandMessage} from "./commands.js"
import {ClockSyncPayload, Transport} from "./components.js"
import {LAG_COMPENSATION_LATENCY} from "./const.js"
import {
  NetworkModel,
  NormalizedNetworkModel,
  normalizeNetworkModel,
} from "./model.js"
import {clientPredictionPlugin} from "./prediction.js"
import {makeNetworkProtocol} from "./protocol.js"
import {NetworkProtocol} from "./resources.js"
import {DEFAULT_MESSAGES} from "./shared.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

let writeStreamReliable = new WriteStream()
let readStream = new ReadStream(new Uint8Array())
let noop = () => {}

let processClientMessagesSystem = (world: j.World) => {
  let protocol = world.getResource(NetworkProtocol)
  world.query(Transport).each((client, transport) => {
    let message: Maybe<Uint8Array>
    while (exists((message = transport.pull()))) {
      readStream.reset(message)
      protocol.decode(readStream, noop, client)
    }
  })
}

let processClockSyncResponsesSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let clockSync = world.getResource(ClockSync)
  world.query(ClockSyncPayload).each((_, clockSyncPayload) => {
    let {serverTime, clientTime} = clockSyncPayload
    if (serverTime > 0) {
      clockSync.addSample(serverTime - (clientTime + time.currentTime) / 2)
      clockSyncPayload.serverTime = 0
    }
  })
}

let clockSyncPayload = {
  clientTime: 0,
  serverTime: 0,
}

let sendClockSyncRequestsSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let networkProtocol = world.getResource(NetworkProtocol)
  let encodeClockSync = networkProtocol.encoder(clockSyncMessage)
  world.query(Transport).each((_, transport) => {
    clockSyncPayload.clientTime = time.currentTime
    encodeClockSync(writeStreamReliable, clockSyncPayload)
    transport.push(writeStreamReliable.bytes(), true)
    writeStreamReliable.reset()
  })
  world.setResource(ClockSyncRequestTime, time.currentTime)
}

let controlFixedTimestepSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let serverOffset = world.getResource(ClockSync).getMeanOffset()
  if (serverOffset < Infinity) {
    let serverTime = time.currentTime + serverOffset + LAG_COMPENSATION_LATENCY
    world.setResource(j.FixedTimestepTargetTime, serverTime)
  }
}

let sendClientCommandsSystem = (world: j.World) => {
  let timestamp = world.getResource(j.FixedStep)
  let networkModel = world.getResource(NormalizedNetworkModel)
  let networkProtocol = world.getResource(NetworkProtocol)
  let commands = world.getResource(j.Commands)
  let encodeCommand = networkProtocol.encoder(commandMessage)
  world.query(Transport).each((_, transport) => {
    for (let i = 0; i < networkModel.commandTypes.length; i++) {
      let commandType = networkModel.commandTypes[i]
      commands.of(commandType, command => {
        encodeCommand(writeStreamReliable, commandType, command, timestamp)
      })
    }
    let bytes = writeStreamReliable.bytes()
    if (bytes.length > 0) {
      transport.push(bytes, true)
      writeStreamReliable.reset()
    }
  })
}

export let stepServerWorldSystem = (world: j.World) => {
  let serverWorld = world.getResource(ServerWorld)
  serverWorld[j._emitStagedChanges]()
  serverWorld[j._commitStagedChanges]()
}

let makeDefaultNetworkProtocol = (world: j.World) => {
  let networkProtocol = makeNetworkProtocol(world)
  for (let i = 0; i < DEFAULT_MESSAGES.length; i++) {
    networkProtocol.register(DEFAULT_MESSAGES[i], i)
  }
  return networkProtocol
}

let makeClockSync = () =>
  new ClockSyncImpl({
    expectedOutlierRate: 0.2,
    maxDeviation: 0.1,
    requiredSampleCount: 8,
  })

let shouldRequestClockSync = (world: j.World) => {
  let time = world.getResource(j.Time)
  let clockSyncRequestTime = world.getResource(ClockSyncRequestTime)
  let clockSyncRequestInterval = world.getResource(ClockSyncRequestInterval)
  return time.currentTime > clockSyncRequestTime + clockSyncRequestInterval
}

export let clientPlugin = (app: j.App) => {
  if (!app.hasResource(NetworkProtocol)) {
    let protocol = makeDefaultNetworkProtocol(app.world)
    app.addResource(NetworkProtocol, protocol)
  }
  app
    .addResource(ClockSync, makeClockSync())
    .addResource(ClockSyncRequestTime, 0)
    .addResource(ClockSyncRequestInterval, 0.2)
    .addResource(ServerWorld, new j.World())
    .addResource(
      NormalizedNetworkModel,
      normalizeNetworkModel(app.getResource(NetworkModel) ?? []),
    )
    .addSystemToGroup(j.Group.Early, processClientMessagesSystem)
    .addSystemToGroup(j.Group.Early, processClockSyncResponsesSystem)
    .addSystemToGroup(
      j.Group.Early,
      sendClockSyncRequestsSystem,
      null,
      shouldRequestClockSync,
    )
    .addSystemToGroup(
      j.Group.Early,
      controlFixedTimestepSystem,
      j.before(j.advanceFixedTimestepSystem),
    )
    .addSystemToGroup(j.FixedGroup.LateUpdate, stepServerWorldSystem)
    .addSystemToGroup(
      j.FixedGroup.Late,
      sendClientCommandsSystem,
      null,
      world => world.hasResource(j.FixedTimestepTargetTime),
    )
    .use(clientPredictionPlugin)
}
