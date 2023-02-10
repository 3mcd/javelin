import * as j from "@javelin/ecs"
import {advanceTimeSystem, Singleton, Type} from "@javelin/ecs"
import {exists, expect, Maybe, SparseSet} from "@javelin/lib"
import {AwarenessState as _AwarenessState} from "./awareness.js"
import {clockSyncMessage} from "./clock_sync.js"
import {AddressedCommand, commandMessage} from "./commands.js"
import {Awareness, Client, ClockSyncPayload, Transport} from "./components.js"
import {LAG_COMPENSATION_LATENCY} from "./const.js"
import {interestMessage} from "./interest.js"
import {
  NetworkModel,
  NormalizedNetworkModel,
  normalizeNetworkModel,
} from "./model.js"
import {presenceMessage} from "./presence.js"
import {
  CommandStage,
  ensureCommandBuffer,
  NetworkProtocol,
} from "./resources.js"
import {eligibleForSend} from "./sendable.js"
import {makeDefaultProtocol} from "./shared.js"
import {snapshotMessage} from "./snapshot.js"
import {ReadStream, WriteStream} from "./structs/stream.js"
import {TimestampBuffer} from "./timestamp_buffer.js"
import {Transport as _Transport} from "./transport.js"

export type CommandValidator = <T>(
  world: j.World,
  client: j.Entity,
  commandType: j.Command<T>,
  command: j.ComponentValue<T>,
) => boolean
export let CommandValidator = j.resource<CommandValidator>()
let ValidatedCommandStage =
  j.resource<SparseSet<TimestampBuffer<AddressedCommand>>>()

let AwarenessState = j.value<_AwarenessState>()
let InitializedClient = j.type(Client, AwarenessState)

let readStream = new ReadStream(new Uint8Array())
let writeStreamReliable = new WriteStream()
let writeStreamUnreliable = new WriteStream()

let sendAndReset = (stream: WriteStream, transport: _Transport) => {
  if (stream.offset > 0) {
    let message = stream.bytes()
    transport.push(message, true)
    stream.reset()
  }
}

let controlFixedTimestepSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  world.setResource(
    j.FixedTimestepTargetTime,
    time.currentTime - LAG_COMPENSATION_LATENCY,
  )
}

let initClientAwarenessesSystem = (world: j.World) => {
  world.monitor(Client).eachIncluded(client => {
    let clientAwareness = expect(world.get(client, Awareness))
    world.add(client, AwarenessState, clientAwareness.init())
  })
}

let processClientMessagesSystem = (world: j.World) => {
  let protocol = world.getResource(NetworkProtocol)
  world
    .query(InitializedClient)
    .as(Transport)
    .each(function recvClientMessages(client, transport) {
      let message: Maybe<Uint8Array>
      while (exists((message = transport.pull()))) {
        readStream.reset(message)
        protocol.decode(readStream, () => {}, client)
      }
    })
}

let processClientClockSyncRequestsSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let protocol = world.getResource(NetworkProtocol)
  let encodeClockSync = protocol.encoder(clockSyncMessage)
  world
    .query(Client)
    .as(Transport, ClockSyncPayload)
    .each((_, transport, clockSyncPayload) => {
      if (clockSyncPayload.clientTime > 0) {
        clockSyncPayload.serverTime = time.currentTime
        encodeClockSync(writeStreamReliable, clockSyncPayload)
        sendAndReset(writeStreamReliable, transport)
        clockSyncPayload.clientTime = 0
      }
    })
}

let dispatchClientCommandsSystem = (world: j.World) => {
  let timestamp = world.getResource(j.FixedStep)
  let commands = world.getResource(j.Commands)
  let commandStage = world.getResource(ValidatedCommandStage)
  let commandBuffers = commandStage.values()
  let commandBufferTypeHashes = commandStage.keys()
  for (let i = 0; i < commandBuffers.length; i++) {
    let commandBuffer = commandBuffers[i]
    let commandBufferTypeHash = commandBufferTypeHashes[i]
    let commandBufferType = Type.cache[commandBufferTypeHash]
    commandBuffer.drainTo(timestamp, command => {
      commands.dispatch(commandBufferType, command)
    })
  }
}

let sendPresenceMessages = (world: j.World) => {
  let time = world.getResource(j.FixedTime)
  let protocol = world.getResource(NetworkProtocol)
  let encodePresence = protocol.encoder(presenceMessage)
  world
    .query(InitializedClient)
    .as(Transport, AwarenessState)
    .each(function sendPresenceMessage(client, transport, awareness) {
      for (let i = 0; i < awareness.presences.length; i++) {
        let presence = awareness.presences[i]
        presence.step(world, client, awareness.subjects, writeStreamReliable)
        if (eligibleForSend(presence, time.currentTime)) {
          encodePresence(writeStreamReliable, presence)
          sendAndReset(writeStreamReliable, transport)
          presence.lastSendTime = time.currentTime
        }
      }
    })
}

export let sendInterestMessages = (world: j.World) => {
  let time = world.getResource(j.FixedTime)
  let protocol = world.getResource(NetworkProtocol)
  let encodeInterest = protocol.encoder(interestMessage)
  world
    .query(InitializedClient)
    .as(Transport, AwarenessState)
    .each(function sendInterestMessage(client, transport, awareness) {
      for (let i = 0; i < awareness.interests.length; i++) {
        let interest = awareness.interests[i]
        interest.step(world, client, awareness.subjects)
        if (eligibleForSend(interest, time.currentTime)) {
          encodeInterest(writeStreamReliable, interest)
          sendAndReset(writeStreamReliable, transport)
          interest.lastSendTime = time.currentTime
        }
      }
    })
}

let sendSnapshotMessages = (world: j.World) => {
  let time = world.getResource(j.FixedTime)
  let timestamp = world.getResource(j.FixedStep)
  let protocol = world.getResource(NetworkProtocol)
  let encodeSnapshot = protocol.encoder(snapshotMessage)
  world
    .query(InitializedClient)
    .as(Transport, AwarenessState)
    .each(function sendSnapshotMessage(client, transport, awareness) {
      for (let i = 0; i < awareness.snapshotInterests.length; i++) {
        let snapshotInterest = awareness.snapshotInterests[i]
        snapshotInterest.step(world, client, awareness.subjects)
        if (eligibleForSend(snapshotInterest, time.currentTime)) {
          encodeSnapshot(writeStreamUnreliable, snapshotInterest, timestamp)
          sendAndReset(writeStreamUnreliable, transport)
          snapshotInterest.lastSendTime = time.currentTime
        }
      }
    })
}

let sendServerMessagesSystem = (world: j.World) => {
  sendPresenceMessages(world)
  sendInterestMessages(world)
  sendSnapshotMessages(world)
}

let broadcastValidatedCommand = (
  world: j.World,
  command: AddressedCommand,
  commandType: Singleton,
  commandTimestamp: number,
) => {
  let protocol = world.getResource(NetworkProtocol)
  let encodeCommand = protocol.encoder(commandMessage)
  world
    .query(InitializedClient)
    .as(Transport)
    .each((nextClient, nextClientTransport) => {
      if (nextClient !== command.source) {
        encodeCommand(
          writeStreamReliable,
          commandType,
          command,
          commandTimestamp,
        )
        sendAndReset(writeStreamReliable, nextClientTransport)
      }
    })
}

let processClientCommandsSystem = (world: j.World) => {
  let commandStage = world.getResource(CommandStage)
  let commandBuffers =
    commandStage.values() as TimestampBuffer<AddressedCommand>[]
  let commandBufferTypeHashes = commandStage.keys()
  let commandValidator = world.getResource(CommandValidator)
  let validatedCommandStage = world.getResource(ValidatedCommandStage)
  for (let i = 0; i < commandBuffers.length; i++) {
    let commandBuffer = commandBuffers[i]
    let commandBufferTypeHash = commandBufferTypeHashes[i]
    let commandBufferType = Type.cache[commandBufferTypeHash]
    commandBuffer.drainAll((command, commandTimestamp) => {
      if (commandValidator(world, command.source, commandBufferType, command)) {
        broadcastValidatedCommand(
          world,
          command,
          commandBufferType,
          commandTimestamp,
        )
        ensureCommandBuffer(validatedCommandStage, commandBufferType).insert(
          command,
          commandTimestamp,
        )
      }
    })
  }
}

export let serverPlugin = (app: j.App) => {
  if (!app.hasResource(NetworkProtocol)) {
    let protocol = makeDefaultProtocol(app.world)
    app.addResource(NetworkProtocol, protocol)
  }
  if (!app.hasResource(CommandValidator)) {
    app.addResource(CommandValidator, () => true)
  }
  app
    .addResource(CommandStage, new SparseSet())
    .addResource(ValidatedCommandStage, new SparseSet())
    .addResource(
      NormalizedNetworkModel,
      normalizeNetworkModel(expect(app.getResource(NetworkModel))),
    )
    .addSystemToGroup(
      j.Group.Early,
      controlFixedTimestepSystem,
      j.after(advanceTimeSystem).before(j.controlFixedTimestepSystem),
    )
    .addSystemToGroup(j.Group.Early, processClientMessagesSystem)
    .addSystemToGroup(
      j.Group.Early,
      processClientClockSyncRequestsSystem,
      j.after(processClientMessagesSystem),
    )
    .addSystemToGroup(j.Group.Early, processClientCommandsSystem)
    .addSystemToGroup(j.FixedGroup.Update, dispatchClientCommandsSystem)
    .addSystemToGroup(j.FixedGroup.Late, initClientAwarenessesSystem)
    .addSystemToGroup(j.FixedGroup.Late, sendServerMessagesSystem)
}
