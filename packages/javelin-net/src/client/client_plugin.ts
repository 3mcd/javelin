import {App, Group, Selector, Term, Type, World} from "@javelin/ecs"
import {
  exists,
  expect,
  HASH_BASE,
  hash_word,
  Maybe,
  normalize_hash,
} from "@javelin/lib"
import {
  NetworkConfig,
  NetworkModel,
  NetworkModelImpl,
} from "../network_resources.js"
import {ReadStream} from "../stream/read_stream.js"
import {ServerTransport} from "./client_resources.js"

let read_stream = new ReadStream(new Uint8Array(0))

let process_server_messages_system = (world: World) => {
  let server_transport = expect(world.get_resource(ServerTransport))
  let network_model = expect(world.get_resource(NetworkModel))
  let message: Maybe<Uint8Array>
  while ((message = server_transport.recv())) {
    read_stream.reset(message)
    let message_type = read_stream.read_u8()
    switch (message_type) {
      case 0: {
        let terms_size = read_stream.read_u32()
        let terms_hash = HASH_BASE
        for (let i = 0; i < terms_size; i++) {
          let term = read_stream.read_u32()
          terms_hash = hash_word(
            terms_hash,
            network_model.to_local(term),
          )
        }
        terms_hash = normalize_hash(terms_hash)
        let type = Type.cache[terms_hash]
        if (!exists(type)) {
          let terms = [] as Term[]
          for (let i = 0; i < terms_size; i++) {
            let term = read_stream.peek_u32(-terms_size + i)
            terms.push(network_model.to_local(term))
          }
          type = Type.of(terms)
        }
        let included_size = read_stream.read_u32()
        let excluded_size = read_stream.read_u32()
        for (let i = 0; i < included_size; i++) {
          let entity_id = read_stream.read_u32()
          let entity = world.qualify(entity_id)
          if (exists(entity)) {
            world.add(entity, new Selector(type.components))
          } else {
            world.reserve(entity_id, new Selector(type.components))
          }
        }
        for (let i = 0; i < excluded_size; i++) {
          let entity_id = read_stream.read_u32()
          let entity = world.qualify(entity_id)
          if (exists(entity)) {
            world.remove(entity, new Selector(type.components))
          }
        }
        break
      }
      default:
        throw new Error(`Unknown message type ${message_type}`)
    }
  }
}

export let client_plugin = (app: App) => {
  let network_terms = expect(app.get_resource(NetworkConfig))
  let network_model = new NetworkModelImpl(network_terms)
  app
    .add_resource(NetworkModel, network_model)
    .add_system_to_group(Group.Early, process_server_messages_system)
}
