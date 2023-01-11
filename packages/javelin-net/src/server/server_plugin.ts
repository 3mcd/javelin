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

let initialize_awareness_system = (world: World) => {
  world
    .monitor(Client)
    .each_included(entity => {
      let awareness = expect(world.get(entity, Awareness))
      let awareness_state = new AwarenessStateImpl(world, awareness)
      world.add(entity, type(AwarenessState), awareness_state)
    })
    .each_excluded(entity => {
      let awareness_state = expect(world.get(entity, AwarenessState))
      awareness_state.dispose()
      world.remove(entity, type(AwarenessState))
    })
}

let send_client_messages_system = (world: World) => {
  let network_model = world.get_resource(NetworkModel)
  world
    .of(Client, AwarenessState)
    .as(NetworkTransport, AwarenessState)
    .each((_, client_transport, client_awareness) => {
      for (let interest of client_awareness.interests) {
        interest.update(network_model, client_transport)
      }
    })
}

export let server_plugin = (app: App) => {
  let network_terms = expect(app.get_resource(NetworkConfig))
  let network_model = new NetworkModelImpl(network_terms)
  app
    .add_resource(NetworkModel, network_model)
    .add_system_to_group(Group.Early, initialize_awareness_system)
    .add_system_to_group(Group.Late, send_client_messages_system)
}
