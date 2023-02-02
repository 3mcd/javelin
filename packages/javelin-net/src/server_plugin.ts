import * as j from "@javelin/ecs"
import {command, Command} from "@javelin/ecs"
import {exists, expect, Maybe, SparseSet} from "@javelin/lib"
import {AwarenessState} from "./awareness.js"
import {clockSyncMessageType} from "./clock_sync.js"
import {
  Awareness,
  Client,
  ClockSyncPayload,
  Commands,
  Transport,
} from "./components.js"
import {interestMessageType} from "./interest.js"
import {
  NetworkModel,
  NormalizedNetworkModel,
  normalizeNetworkModel,
} from "./network_model.js"
import {presenceMessageType} from "./presence.js"
import {makeProtocol} from "./protocol.js"
import {NetworkProtocol} from "./resources.js"
import {
  snapshotInterestMessageType,
  SnapshotInterestStateImpl,
} from "./snapshot_interest.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

export type ClientCommandValidator = <T>(
  entity: j.Entity,
  commandType: j.Command<T>,
  command: j.ComponentValue<T>,
) => boolean
export let ClientCommandValidator = j.resource<ClientCommandValidator>()

let AwarenessState = j.value<AwarenessState>()
let InitializedClient = j.type(Client, AwarenessState, Commands)

let readStream = new ReadStream(new Uint8Array())
let writeStreamReliable = new WriteStream()
let writeStreamUnreliable = new WriteStream()

let initClientAwarenessesSystem = (world: j.World) => {
  world.monitor(Client).eachIncluded(client => {
    let clientAwareness = expect(world.get(client, Awareness))
    let clientCommandQueues = new SparseSet<unknown[]>()
    world.add(
      client,
      j.type(AwarenessState, Commands),
      clientAwareness.init(),
      clientCommandQueues,
    )
  })
}

let sendServerMessagesSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let protocol = world.getResource(NetworkProtocol)
  world
    .of(InitializedClient)
    .as(Transport, AwarenessState)
    .each(function sendServerMessages(client, transport, awareness) {
      for (let i = 0; i < awareness.presences.length; i++) {
        let presence = awareness.presences[i]
        presence.prioritize(world, client, awareness.subjects)
        protocol.encodeMessage(
          world,
          writeStreamReliable,
          presenceMessageType,
          presence,
        )
        if (writeStreamReliable.offset > 0) {
          let message = writeStreamReliable.bytes()
          transport.push(message, true)
          writeStreamReliable.reset()
        }
      }
      for (let i = 0; i < awareness.interests.length; i++) {
        let interest = awareness.interests[i]
        interest.prioritize(world, client, awareness.subjects)
        if (time.currentTime > interest.lastSendTime + interest.sendRate) {
          let messageType =
            interest instanceof SnapshotInterestStateImpl
              ? snapshotInterestMessageType
              : interestMessageType
          protocol.encodeMessage(
            world,
            writeStreamUnreliable,
            messageType,
            interest,
          )
          if (writeStreamUnreliable.offset > 0) {
            let message = writeStreamUnreliable.bytes()
            transport.push(message, true)
            writeStreamUnreliable.reset()
          }
          interest.lastSendTime = time.currentTime
        }
      }
    })
}

let processClientMessagesSystem = (world: j.World) => {
  let protocol = world.getResource(NetworkProtocol)
  world
    .of(InitializedClient)
    .as(Transport)
    .each(function recvClientMessages(client, transport) {
      let message: Maybe<Uint8Array>
      while (exists((message = transport.pull()))) {
        readStream.reset(message)
        protocol.decodeMessage(world, readStream, client)
      }
    })
}

let processClientCommandsSystem = (world: j.World) => {
  let clientCommandValidator = world.getResource(ClientCommandValidator)
  world
    .of(InitializedClient)
    .as(Commands)
    .each((client, commands) => {
      let commandComponents = commands.keys()
      let commandQueues = commands.values()
      for (let i = 0; i < commandQueues.length; i++) {
        let commandComponent = commandComponents[i] as j.Component
        let commandType = j.type(commandComponent)
        let commandQueue = commandQueues[i]
        let command: Maybe<unknown>
        while (exists((command = commandQueue.pop()))) {
          if (clientCommandValidator(client, commandType, command)) {
            world.dispatch(commandType, command)
          }
        }
      }
    })
}

let processClientClockSyncRequestsSystem = (world: j.World) => {
  let protocol = world.getResource(NetworkProtocol)
  let time = world.getResource(j.Time)
  world
    .of(Client)
    .as(Transport, ClockSyncPayload)
    .each((_, transport, clockSyncPayload) => {
      if (clockSyncPayload.clientTime > 0) {
        clockSyncPayload.serverTime = time.currentTime
        protocol.encodeMessage(
          world,
          writeStreamReliable,
          clockSyncMessageType,
          clockSyncPayload,
        )
        transport.push(writeStreamReliable.bytes(), true)
        writeStreamReliable.reset()
        clockSyncPayload.clientTime = 0
      }
    })
}

export let serverPlugin = (app: j.App) => {
  let protocol = app.getResource(NetworkProtocol)
  if (!exists(protocol)) {
    protocol = makeProtocol()
    app.addResource(NetworkProtocol, protocol)
  }
  let clientCommandValidator = app.getResource(ClientCommandValidator)
  if (!exists(clientCommandValidator)) {
    clientCommandValidator = () => true
    app.addResource(ClientCommandValidator, clientCommandValidator)
  }
  app
    .addResource(
      NormalizedNetworkModel,
      normalizeNetworkModel(expect(app.getResource(NetworkModel))),
    )
    .addSystemToGroup(j.Group.Late, initClientAwarenessesSystem)
    .addSystemToGroup(j.Group.Early, processClientMessagesSystem)
    .addSystemToGroup(
      j.Group.Early,
      processClientClockSyncRequestsSystem,
      j.after(processClientMessagesSystem),
    )
    .addSystemToGroup(
      j.Group.Early,
      processClientCommandsSystem,
      j.after(processClientMessagesSystem),
    )
    .addSystemToGroup(j.Group.Late, sendServerMessagesSystem)
}
