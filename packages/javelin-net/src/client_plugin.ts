import * as j from "@javelin/ecs"
import {exists, expect, Maybe} from "@javelin/lib"
import {ClockSyncImpl, clockSyncMessageType} from "./clock_sync.js"
import {ClockSyncPayload, Transport} from "./components.js"
import {
  NetworkModel,
  NormalizedNetworkModel,
  normalizeNetworkModel,
} from "./network_model.js"
import {makeProtocol} from "./protocol.js"
import {Protocol} from "./resources.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

export let ServerWorld = j.resource<j.World>()
export let ClockSync = j.resource<ClockSyncImpl>()
export let ClockSyncRequestInterval = j.resource<number>()
export let ClockSyncRequestTime = j.resource<number>()

let writeStreamReliable = new WriteStream()
let readStream = new ReadStream(new Uint8Array())

let processClientMessagesSystem = (world: j.World) => {
  let protocol = world.getResource(Protocol)
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
  let serverOffset = world.getResource(ClockSync).getMeanOffset()
  if (serverOffset < Infinity) {
    world.setResource(
      j.FixedTimestepTargetTime,
      time.currentTime + serverOffset + 0.3, // lag compensation latency
    )
  }
}

let clockSyncPayload = {
  clientTime: 0,
  serverTime: 0,
}

let sendClientClockSyncRequestsSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let protocol = world.getResource(Protocol)
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

export let clientPlugin = (app: j.App) => {
  let clockSync = new ClockSyncImpl({
    expectedOutlierRate: 0.2,
    maxDeviation: 0.1,
    requiredSampleCount: 8,
  })
  let protocol = app.getResource(Protocol)
  if (!exists(protocol)) {
    protocol = makeProtocol()
    app.addResource(Protocol, protocol)
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
}
