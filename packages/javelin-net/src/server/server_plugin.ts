import {App, Group, type, World} from "@javelin/ecs"
import {expect} from "@javelin/lib"
import {
  NetworkConfig,
  NetworkModel,
  NetworkModelImpl,
} from "../network_resources.js"
import {NetworkTransport} from "../network_transport.js"
import {
  Awareness,
  AwarenessState,
  AwarenessStateImpl,
} from "./awareness.js"

export let Client = type(NetworkTransport, Awareness)

let initializeAwarenessSystem = (world: World) => {
  world.monitor(Client).eachIncluded(entity => {
    console.log("creating client ", entity, " awareness state")
    let awareness = expect(world.get(entity, Awareness))
    let awarenessState = new AwarenessStateImpl(world, awareness)
    world.add(entity, type(AwarenessState), awarenessState)
  })
  world
    .monitorImmediate(Client, AwarenessState)
    .eachExcluded(entity => {
      console.log("removing client ", entity, " awareness state")
      let awarenessState = expect(world.get(entity, AwarenessState))
      awarenessState.dispose()
      world.remove(entity, type(AwarenessState))
    })
}

let sendClientMessagesSystem = (world: World) => {
  let networkModel = world.getResource(NetworkModel)
  world
    .of(Client, AwarenessState)
    .as(NetworkTransport, AwarenessState)
    .each((_, clientTransport, clientAwareness) => {
      for (let interest of clientAwareness.interests) {
        interest.update(networkModel, clientTransport)
      }
    })
}

export let serverPlugin = (app: App) => {
  let networkTerms = expect(app.getResource(NetworkConfig))
  let networkModel = new NetworkModelImpl(networkTerms)
  app
    .addResource(NetworkModel, networkModel)
    .addSystemToGroup(Group.EarlyUpdate, initializeAwarenessSystem)
    .addSystemToGroup(Group.Late, sendClientMessagesSystem)
}
