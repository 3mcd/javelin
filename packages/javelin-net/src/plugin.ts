import {
  App,
  Group,
  resource,
  type,
  value,
  World,
  _commitStagedChanges,
  _emitStagedChanges,
} from "@javelin/ecs"
import {exists, Maybe} from "@javelin/lib"
import {IAwareness} from "./awareness.js"
import {interestMessageType} from "./interest.js"
import {presenceMessageType} from "./presence.js"
import {IProtocol, makeProtocol} from "./protocol.js"
import {ReadStream, WriteStream} from "./stream.js"
import {ITransport} from "./transport.js"

export let Transport = value<ITransport>()
export let Awareness = value<IAwareness>()
export let Client = type(Transport, Awareness)

export let RemoteWorld = resource<World>()
export let Protocol = resource<IProtocol>()

let writeStreamReliable = new WriteStream()
let writeStreamUnreliable = new WriteStream()
let readStream = new ReadStream(new Uint8Array())

let sendServerMessagesSystem = (world: World) => {
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

let processClientMessagesSystem = (world: World) => {
  let protocol = world.getResource(Protocol)
  let remoteWorld = world.getResource(RemoteWorld)
  world.of(Transport).each(function processClientMessages(_, transport) {
    let message: Maybe<Uint8Array>
    while (exists((message = transport.pull()))) {
      readStream.reset(message)
      protocol.decodeMessage(remoteWorld, readStream)
    }
  })
  remoteWorld[_emitStagedChanges]()
  remoteWorld[_commitStagedChanges]()
}

export let clientPlugin = (app: App) => {
  let protocol = app.getResource(Protocol)
  if (!exists(protocol)) {
    protocol = makeProtocol()
    app.addResource(Protocol, protocol)
  }
  protocol
    .addMessageType(presenceMessageType)
    .addMessageType(interestMessageType)
  if (!app.hasResource(RemoteWorld)) {
    let remoteWorld = new World()
    app.addResource(RemoteWorld, remoteWorld)
  }
  app.addSystemToGroup(Group.Early, processClientMessagesSystem)
}

export let serverPlugin = (app: App) => {
  let protocol = app.getResource(Protocol)
  if (!exists(protocol)) {
    protocol = makeProtocol()
    app.addResource(Protocol, protocol)
  }
  protocol
    .addMessageType(presenceMessageType)
    .addMessageType(interestMessageType)
  app.addSystemToGroup(Group.Early, sendServerMessagesSystem)
}
