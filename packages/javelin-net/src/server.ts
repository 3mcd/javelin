import * as j from "@javelin/ecs"
import {exists, expect, Maybe} from "@javelin/lib"
import {AwarenessState as _AwarenessState} from "./awareness.js"
import {clockSyncMessage} from "./clock_sync.js"
import {commandMessage} from "./commands.js"
import {Awareness, Client, ClockSyncPayload, Transport} from "./components.js"
import {interestMessage} from "./interest.js"
import {Model, NormalizedModel, normalizeModel} from "./model.js"
import {presenceMessage} from "./presence.js"
import {makeProtocol} from "./protocol.js"
import {Protocol} from "./resources.js"
import {eligibleForSend} from "./sendable.js"
import {DEFAULT_MESSAGES} from "./shared.js"
import {snapshotMessage} from "./snapshot.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

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

let initClientAwarenessesSystem = (world: j.World) => {
  world.monitor(Client).eachIncluded(client => {
    let clientAwareness = expect(world.get(client, Awareness))
    world.add(client, AwarenessState, clientAwareness.init())
  })
}

let sendServerMessagesSystem = (world: j.World) => {
  let time = world.getResource(j.Time)
  let protocol = world.getResource(Protocol)
  let encodePresence = protocol.encoder(presenceMessage)
  let encodeInterest = protocol.encoder(interestMessage)
  let enocdeSnapshotInterest = protocol.encoder(snapshotMessage)
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
        let interest = awareness.snapshotInterests[i]
        interest.step(world, client, awareness.subjects)
        if (eligibleForSend(interest, time.currentTime)) {
          enocdeSnapshotInterest(writeStreamUnreliable, interest)
          interest.lastSendTime = time.currentTime
        }
      }
      if (writeStreamUnreliable.offset > 0) {
        let snapshotInterestMessage = writeStreamUnreliable.bytes()
        transport.push(snapshotInterestMessage, false)
        writeStreamUnreliable.reset()
      }
    })
}

let processClientMessagesSystem = (world: j.World) => {
  let protocol = world.getResource(Protocol)
  let commands = world.getResource(j.Commands)
  let commandIsValid = world.getResource(CommandValidator)
  world
    .query(InitializedClient)
    .as(Transport)
    .each(function recvClientMessages(client, transport) {
      let message: Maybe<Uint8Array>
      while (exists((message = transport.pull()))) {
        readStream.reset(message)
        protocol.decode(
          readStream,
          (message, payload) => {
            switch (message) {
              case commandMessage: {
                let [commandType, command] = payload as [j.Singleton, unknown]
                let encodeCommand = protocol.encoder(commandMessage)
                if (!commandIsValid(world, client, commandType, command)) {
                  return
                }
                commands.dispatch(commandType, command)
                world
                  .query(InitializedClient)
                  .as(Transport)
                  .each((nextClient, nextClientTransport) => {
                    if (nextClient !== client) {
                      encodeCommand(writeStreamReliable, commandType, command)
                      nextClientTransport.push(
                        writeStreamReliable.bytes(),
                        true,
                      )
                      writeStreamReliable.reset()
                    }
                  })
              }
            }
          },
          client,
        )
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

export let serverPlugin = (app: j.App) => {
  let protocol = app.getResource(Protocol)
  if (!exists(protocol)) {
    protocol = makeProtocol(app.world)
    for (let i = 0; i < DEFAULT_MESSAGES.length; i++) {
      protocol.register(DEFAULT_MESSAGES[i], i)
    }
    app.addResource(Protocol, protocol)
  }
  if (!app.hasResource(CommandValidator)) {
    app.addResource(CommandValidator, () => true)
  }
  app
    .addResource(
      NormalizedModel,
      normalizeModel(expect(app.getResource(Model))),
    )
    .addSystemToGroup(j.Group.Late, initClientAwarenessesSystem)
    .addSystemToGroup(j.Group.Early, processClientMessagesSystem)
    .addSystemToGroup(
      j.Group.Early,
      processClientClockSyncRequestsSystem,
      j.after(processClientMessagesSystem),
    )
    .addSystemToGroup(j.Group.Late, sendServerMessagesSystem)
}
