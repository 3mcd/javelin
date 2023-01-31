import * as j from "@javelin/ecs"
import {exists, expect, Maybe} from "@javelin/lib"
import {interestMessageType} from "./interest.js"
import {presenceMessageType} from "./presence.js"
import {makeProtocol} from "./protocol.js"
import {ReadStream, WriteStream} from "./structs/stream.js"
import {Client, ClockSyncPayload, Transport} from "./components.js"
import {Protocol} from "./resources.js"
import {clockSyncMessageType} from "./clock_sync.js"
import {
  NetworkModel,
  NormalizedNetworkModel,
  normalizeNetworkModel,
} from "./network_model.js"

let readStream = new ReadStream(new Uint8Array())
let writeStreamReliable = new WriteStream()
let writeStreamUnreliable = new WriteStream()

let sendServerMessagesSystem = (world: j.World) => {
  let protocol = world.getResource(Protocol)
  world.of(Client).each(function sendServerMessages(_, transport, awareness) {
    for (let i = 0; i < awareness.presences.length; i++) {
      let presence = awareness.presences[i]
      presence.prioritize(world)
      protocol.encodeMessage(
        world,
        writeStreamReliable,
        presenceMessageType,
        presence,
      )
      protocol.encodeMessage(
        world,
        writeStreamUnreliable,
        interestMessageType,
        presence,
      )
      transport.push(writeStreamReliable.bytes(), true)
      transport.push(writeStreamUnreliable.bytes(), false)
      writeStreamReliable.reset()
      writeStreamUnreliable.reset()
    }
  })
}

let processClientMessagesSystem = (world: j.World) => {
  let protocol = world.getResource(Protocol)
  world.of(Client).each(function recvClientMessages(client, transport) {
    let message: Maybe<Uint8Array>
    while (exists((message = transport.pull()))) {
      readStream.reset(message)
      protocol.decodeMessage(world, readStream, client)
    }
  })
}

let processClientClockSyncRequestsSystem = (world: j.World) => {
  let protocol = world.getResource(Protocol)
  let time = world.getResource(j.FixedTime)
  world
    .of(Client)
    .as(Transport, ClockSyncPayload)
    .each((_, transport, clockSyncPayload) => {
      if (clockSyncPayload.clientTime > 0) {
        protocol.encodeMessage(
          world,
          writeStreamReliable,
          clockSyncMessageType,
          {
            clientTime: clockSyncPayload.clientTime,
            serverTime: time.currentTime,
          },
        )
        transport.push(writeStreamReliable.bytes(), true)
        writeStreamReliable.reset()
        clockSyncPayload.clientTime = 0
      }
    })
}

export let serverPlugin = (app: j.App) => {
  let protocol = app.getResource(Protocol)
  if (!exists(protocol)) {
    protocol = makeProtocol()
    app.addResource(Protocol, protocol)
  }
  app
    .addResource(
      NormalizedNetworkModel,
      normalizeNetworkModel(expect(app.getResource(NetworkModel))),
    )
    .addSystemToGroup(j.Group.Early, processClientMessagesSystem)
    .addSystemToGroup(
      j.Group.Early,
      processClientClockSyncRequestsSystem,
      j.after(processClientMessagesSystem),
    )
    .addSystemToGroup(j.Group.Late, sendServerMessagesSystem)
}
