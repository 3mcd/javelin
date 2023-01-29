import { App, Group, resource, type, value, World } from "@javelin/ecs"
import { exists, Maybe } from "@javelin/lib"
import { IAwareness } from "./awareness.js"
import { interestMessageType } from "./interest.js"
import { presenceMessageType } from "./presence.js"
import { IProtocol, makeProtocol } from "./protocol.js"
import { ReadStream, WriteStream } from "./stream.js"
import { ITransport } from "./transport.js"

export let Transport = value<ITransport>()
export let Awareness = value<IAwareness>()
export let Client = type(Transport, Awareness)

export let RemoteWorld = resource<World>()
export let Protocol = resource<IProtocol>()

let writeStreamReliable = new WriteStream()
let writeStreamUnreliable = new WriteStream()
let readStream = new ReadStream(new Uint8Array())

let serverUpdateClientsSystem = (world: World) => {
  let protocol = world.getResource(Protocol)
  world.of(Client).each((_, transport, awareness) => {
    for (let i = 0; i < awareness.presences.length; i++) {
      let presence = awareness.presences[i]
      presence.prioritize(world)
      protocol.encode(world, writeStreamReliable, presenceMessageType, presence)
      protocol.encode(
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

let clientProcessMessagesSystem = (world: World) => {
  let protocol = world.getResource(Protocol)
  let remoteWorld = world.getResource(RemoteWorld)
  world.of(Transport).each((_, transport) => {
    let message: Maybe<Uint8Array>
    while (exists((message = transport.pull()))) {
      readStream.reset(message)
      protocol.decode(remoteWorld, readStream)
    }
  })
  remoteWorld.emitStagedChanges()
  remoteWorld.commitStagedChanges()
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
  app.addSystemToGroup(Group.Early, clientProcessMessagesSystem)
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
  app.addSystemToGroup(Group.Early, serverUpdateClientsSystem)
}
