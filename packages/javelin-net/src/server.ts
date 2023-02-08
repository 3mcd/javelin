import * as j from "@javelin/ecs"
import {advanceTimeSystem, Singleton, Type} from "@javelin/ecs"
import {exists, expect, Maybe, SparseSet} from "@javelin/lib"
import {AwarenessState as _AwarenessState} from "./awareness.js"
import {clockSyncMessage} from "./clock_sync.js"
import {AddressedCommand, commandMessage} from "./commands.js"
import {Awareness, Client, ClockSyncPayload, Transport} from "./components.js"
import {interestMessage} from "./interest.js"
import {
  NetworkModel,
  NormalizedNetworkModel,
  normalizeNetworkModel,
} from "./model.js"
import {LastCompletedTimestamp} from "./prediction.js"
import {presenceMessage} from "./presence.js"
import {CommandStage, Protocol} from "./resources.js"
import {eligibleForSend} from "./sendable.js"
import {makeDefaultProtocol} from "./shared.js"
import {snapshotMessage} from "./snapshot.js"
import {ReadStream, WriteStream} from "./structs/stream.js"
import {makeTimestamp, makeTimestampFromTime, Timestamp} from "./timestamp.js"

export type CommandValidator = <T>(
  world: j.World,
  client: j.Entity,
  commandType: j.Command<T>,
  command: j.ComponentValue<T>,
) => boolean
export let CommandValidator = j.resource<CommandValidator>()

let AwarenessState = j.value<_AwarenessState>()
let InitializedClient = j.type(Client, AwarenessState)

let readStream = new ReadStream(new Uint8Array())
let writeStreamReliable = new WriteStream()
let writeStreamUnreliable = new WriteStream()

let controlFixedTimestepSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  world.setResource(j.FixedTimestepTargetTime, time.currentTime - 0.3)
}

let initClientAwarenessesSystem = (world: j.World) => {
  world.monitor(Client).eachIncluded(client => {
    let clientAwareness = expect(world.get(client, Awareness))
    world.add(client, AwarenessState, clientAwareness.init())
  })
}

let processClientMessagesSystem = (world: j.World) => {
  let protocol = world.getResource(Protocol)
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
  let protocol = world.getResource(Protocol)
  let encodeClockSync = protocol.encoder(clockSyncMessage)
  world
    .query(Client)
    .as(Transport, ClockSyncPayload)
    .each((_, transport, clockSyncPayload) => {
      if (clockSyncPayload.clientTime > 0) {
        clockSyncPayload.serverTime = time.currentTime
        encodeClockSync(writeStreamReliable, clockSyncPayload)
        let clockSyncMessage = writeStreamReliable.bytes()
        transport.push(clockSyncMessage, true)
        writeStreamReliable.reset()
        clockSyncPayload.clientTime = 0
      }
    })
}

let dispatchClientCommandsSystem = (world: j.World) => {
  // let timestamp = makeTimestampFromTime(
  //   world.getResource(j.FixedTime).currentTime,
  //   1 / 60,
  // )
  let timestamp = makeTimestamp(world.getResource(j.FixedTick))
  world.setResource(LastCompletedTimestamp, timestamp)
  let commands = world.getResource(j.Commands)
  let commandStage = world.getResource(CommandStage)
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

// Does j.FixedTick correspond to the last completed timestamp?

let sendServerMessagesSystem = (world: j.World) => {
  let time = world.getResource(j.FixedTime)
  let timestamp = world.getResource(LastCompletedTimestamp)
  let protocol = world.getResource(Protocol)
  let encodePresence = protocol.encoder(presenceMessage)
  let encodeInterest = protocol.encoder(interestMessage)
  let enocdeSnapshotInterest = protocol.encoder(snapshotMessage)
  if (!timestamp) {
    return
  }
  world
    .query(InitializedClient)
    .as(Transport, AwarenessState)
    .each(function sendServerMessages(client, transport, awareness) {
      for (let i = 0; i < awareness.presences.length; i++) {
        let presence = awareness.presences[i]
        presence.step(world, client, awareness.subjects, writeStreamReliable)
        if (eligibleForSend(presence, time.currentTime)) {
          encodePresence(writeStreamReliable, presence)
          if (writeStreamReliable.offset > 0) {
            let presenceMessage = writeStreamReliable.bytes()
            transport.push(presenceMessage, true)
            writeStreamReliable.reset()
          }
          presence.lastSendTime = time.currentTime
        }
      }
      for (let i = 0; i < awareness.interests.length; i++) {
        let interest = awareness.interests[i]
        interest.step(world, client, awareness.subjects)
        if (eligibleForSend(interest, time.currentTime)) {
          encodeInterest(writeStreamReliable, interest)
          if (writeStreamReliable.offset > 0) {
            let interestMessage = writeStreamReliable.bytes()
            transport.push(interestMessage, true)
            writeStreamReliable.reset()
          }
          interest.lastSendTime = time.currentTime
        }
      }
      for (let i = 0; i < awareness.snapshotInterests.length; i++) {
        let snapshotInterest = awareness.snapshotInterests[i]
        snapshotInterest.step(world, client, awareness.subjects)
        if (eligibleForSend(snapshotInterest, time.currentTime)) {
          enocdeSnapshotInterest(
            writeStreamUnreliable,
            snapshotInterest,
            timestamp,
          )
          snapshotInterest.lastSendTime = time.currentTime
        }
      }
      if (writeStreamUnreliable.offset > 0) {
        let snapshotInterestMessage = writeStreamUnreliable.bytes()
        transport.push(snapshotInterestMessage, false)
        writeStreamUnreliable.reset()
      }
    })
}

let broadcastValidatedCommand = (
  world: j.World,
  command: AddressedCommand,
  commandType: Singleton,
  commandTimestamp: Timestamp,
) => {
  let protocol = world.getResource(Protocol)
  let encodeCommand = protocol.encoder(commandMessage)
  world
    .query(InitializedClient)
    .as(Transport)
    .each((nextClient, nextClientTransport) => {
      if (nextClient !== command.origin) {
        encodeCommand(
          writeStreamReliable,
          commandType,
          command,
          commandTimestamp,
        )
        nextClientTransport.push(writeStreamReliable.bytes(), true)
        writeStreamReliable.reset()
      }
    })
}

let processClientCommandsSystem = (world: j.World) => {
  let commandStage = world.getResource(CommandStage)
  let commandBuffers = commandStage.values()
  let commandBufferTypeHashes = commandStage.keys()
  let commandValidator = world.getResource(CommandValidator)
  for (let i = 0; i < commandBuffers.length; i++) {
    let commandBuffer = commandBuffers[i]
    let commandBufferTypeHash = commandBufferTypeHashes[i]
    let commandBufferType = Type.cache[commandBufferTypeHash]
    commandBuffer.forEachBuffer((commands, commandTimestamp) => {
      for (let i = commands.length - 1; i >= 0; i--) {
        let command = commands[i] as AddressedCommand
        if (
          commandValidator(world, command.origin, commandBufferType, command)
        ) {
          broadcastValidatedCommand(
            world,
            command,
            commandBufferType,
            commandTimestamp,
          )
        } else {
          commands.splice(i, 1)
        }
      }
    })
  }
}

export let serverPlugin = (app: j.App) => {
  if (!app.hasResource(Protocol)) {
    let protocol = makeDefaultProtocol(app.world)
    app.addResource(Protocol, protocol)
  }
  if (!app.hasResource(CommandValidator)) {
    app.addResource(CommandValidator, () => true)
  }
  app
    .addResource(CommandStage, new SparseSet())
    .addResource(
      NormalizedNetworkModel,
      normalizeNetworkModel(expect(app.getResource(NetworkModel))),
    )
    .addSystemToGroup(
      j.Group.Early,
      controlFixedTimestepSystem,
      j.after(advanceTimeSystem).before(j.advanceFixedTimestepSystem),
    )
    .addSystemToGroup(
      j.Group.Early,
      processClientMessagesSystem,
      j.after(controlFixedTimestepSystem),
    )
    .addSystemToGroup(j.Group.Early, processClientClockSyncRequestsSystem)
    .addSystemToGroup(
      j.Group.Early,
      processClientCommandsSystem,
      j.after(processClientMessagesSystem),
    )
    .addSystemToGroup(
      j.Group.Early,
      dispatchClientCommandsSystem,
      j.after(processClientCommandsSystem),
    )
    .addSystemToGroup(j.Group.Late, initClientAwarenessesSystem)
    .addSystemToGroup(j.Group.Late, sendServerMessagesSystem)
}
