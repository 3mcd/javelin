import {App, Group, resource, type, value, World} from "@javelin/ecs"
import {ITransport} from "./transport.js"
import {IAwareness} from "./awareness.js"
import {makeProtocol, IProtocol} from "./protocol.js"
import {exists, Maybe} from "@javelin/lib"
import {presenceMessageType} from "./presence.js"
import {ReadStream, WriteStream} from "./stream.js"

export let Transport = value<ITransport>()
export let Awareness = value<IAwareness>()
export let Client = type(Transport, Awareness)

export let RemoteWorld = resource<World>()
export let Protocol = resource<IProtocol>()

let writeStream = new WriteStream()
let readStream = new ReadStream(new Uint8Array())

let serverUpdateClientsSystem = (world: World) => {
  let protocol = world.getResource(Protocol)
  world.of(Client).each((_, transport, awareness) => {
    for (let i = 0; i < awareness.interests.length; i++) {
      let interest = awareness.interests[i]
      protocol.encode(world, writeStream, presenceMessageType, interest)
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
  let protocol = app.getResource(Protocol)
  if (!exists(protocol)) {
    protocol = makeProtocol()
    app.addResource(Protocol, protocol)
  }
  protocol.addMessageType(presenceMessageType)
  if (!app.hasResource(RemoteWorld)) {
    app.addResource(RemoteWorld, new World())
  }
  app.addSystemToGroup(Group.Early, clientProcessMessagesSystem)
}

export let serverPlugin = (app: App) => {
  let protocol = app.getResource(Protocol)
  if (!exists(protocol)) {
    protocol = makeProtocol()
    app.addResource(Protocol, protocol)
  }
  protocol.addMessageType(presenceMessageType)
  app.addSystemToGroup(Group.Early, serverUpdateClientsSystem)
}
