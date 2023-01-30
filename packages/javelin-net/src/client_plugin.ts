import * as j from "@javelin/ecs"
import {exists, Maybe} from "@javelin/lib"
import {ClockSyncImpl, clockSyncMessageType} from "./clock_sync.js"
import {ClockSyncPayload, Transport} from "./components.js"
import {interestMessageType} from "./interest.js"
import {presenceMessageType} from "./presence.js"
import {makeProtocol} from "./protocol.js"
import {Protocol} from "./resources.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

export let RemoteWorld = j.resource<j.World>()
export let ClockSync = j.resource<ClockSyncImpl>()
export let ClockSyncRequestInterval = j.resource<number>()
export let ClockSyncRequestTime = j.resource<number>()

let writeStreamReliable = new WriteStream()
let readStream = new ReadStream(new Uint8Array())

let processClientMessagesSystem = (world: j.World) => {
  let protocol = world.getResource(Protocol)
  let remoteWorld = world.getResource(RemoteWorld)
  world.of(Transport).each(function processClientMessages(client, transport) {
    let message: Maybe<Uint8Array>
    while (exists((message = transport.pull()))) {
      readStream.reset(message)
      protocol.decodeMessage(remoteWorld, readStream, client)
    }
  })
  remoteWorld[j._emitStagedChanges]()
  remoteWorld[j._commitStagedChanges]()
}

let processClientClockSyncResponsesSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let clockSync = world.getResource(ClockSync)
  let remoteWorld = world.getResource(RemoteWorld)
  remoteWorld.of(ClockSyncPayload).each((_, clockSyncPayload) => {
    if (clockSyncPayload.serverTime > 0) {
      clockSync.addSample(
        clockSyncPayload.serverTime -
          (clockSyncPayload.clientTime + time.currentTime) / 2,
      )
      clockSyncPayload.serverTime = 0
    }
  })
}

let updateFixedTimestepTargetTimeSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let clockSync = world.getResource(ClockSync)
  let offset = clockSync.getMeanOffset()
  let estimatedServerTime =
    offset === Infinity ? 0 : time.currentTime + offset + 0.3 // lag compensation latency;
  if (estimatedServerTime > 0) {
    world.setResource(j.FixedTimestepTargetTime, estimatedServerTime)
  }
}

let sendClientClockSyncRequestsSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let protocol = world.getResource(Protocol)
  world.of(Transport).each(function sendClientClockSyncRequest(_, transport) {
    protocol.encodeMessage(world, writeStreamReliable, clockSyncMessageType, {
      clientTime: time.currentTime,
      serverTime: 0,
    })
    transport.push(writeStreamReliable.bytes(), true)
    writeStreamReliable.reset()
  })
  world.setResource(ClockSyncRequestTime, time.currentTime)
}

export let clientPlugin = (app: j.App) => {
  let clockSync = new ClockSyncImpl({
    expectedOutlierRate: 0.2,
    maxTolerableDeviation: 0.1,
    requiredSampleCount: 8,
  })
  let protocol = app.getResource(Protocol)
  if (!exists(protocol)) {
    protocol = makeProtocol()
    app.addResource(Protocol, protocol)
  }
  protocol
    .addMessageType(presenceMessageType)
    .addMessageType(interestMessageType)
    .addMessageType(clockSyncMessageType)
  if (!app.hasResource(RemoteWorld)) {
    let remoteWorld = new j.World()
    remoteWorld.create(ClockSyncPayload)
    remoteWorld[j._emitStagedChanges]()
    remoteWorld[j._commitStagedChanges]()
    app.addResource(RemoteWorld, remoteWorld)
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
      updateFixedTimestepTargetTimeSystem,
      j.before(j.advanceFixedTimestepSystem),
    )
}
