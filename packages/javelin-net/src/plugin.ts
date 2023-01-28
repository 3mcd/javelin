import { App, Group, resource, type, value, World } from "@javelin/ecs"
import { exists, Maybe } from "@javelin/lib"
import { Awareness as AwarenessType } from "./awareness.js"
import { interestMessageType } from "./interest.js"
import { makeProtocol, Protocol as ProtocolType } from "./protocol.js"
import { ReadStream, WriteStream } from "./stream.js"
import { Transport as TransportType } from "./transport.js"

let Transport = value<TransportType>()
let Awareness = value<AwarenessType>()
let Client = type(Transport, Awareness)

let RemoteWorld = resource<World>()
let Protocol = resource<ProtocolType>()

let writeStream = new WriteStream()
let readStream = new ReadStream(new Uint8Array())

let serverUpdateClientsSystem = (world: World) => {
  let protocol = world.getResource(Protocol)
  world.of(Client).each((_, transport, awareness) => {
    for (let i = 0; i < awareness.interests.length; i++) {
      let interest = awareness.interests[i]
      interest.prioritize(world)
      protocol.encode(world, writeStream, interestMessageType, interest)
      transport.push(writeStream.bytes(), true)
      writeStream.reset()
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
  let protocol: Protocol
  if (app.hasResource(Protocol)) {
    protocol = app.getResource(Protocol)
  } else {
    protocol = makeProtocol()
    app.addResource(Protocol, protocol)
  }
  protocol.addMessageType(interestMessageType)
  if (!app.hasResource(RemoteWorld)) {
    app.addResource(RemoteWorld, new World())
  }
  app.addSystemToGroup(Group.Early, clientProcessMessagesSystem)
}

export let serverPlugin = (app: App) => {
  let protocol: Protocol
  if (app.hasResource(Protocol)) {
    protocol = app.getResource(Protocol)
  } else {
    protocol = makeProtocol()
    app.addResource(Protocol, protocol)
  }

  protocol.addMessageType(interestMessageType)
  app.addSystemToGroup(Group.Early, serverUpdateClientsSystem)
}

export { Transport, Awareness, Client, Protocol }

