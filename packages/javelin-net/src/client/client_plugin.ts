import {App, Group, Selector, Term, Type, World} from "@javelin/ecs"
import {
  exists,
  expect,
  HASH_BASE,
  hashWord,
  Maybe,
  normalizeHash,
} from "@javelin/lib"
import {
  NetworkConfig,
  NetworkModel,
  NetworkModelImpl,
} from "../network_resources.js"
import {ReadStream} from "../stream/read_stream.js"
import {ServerTransport} from "./client_resources.js"

let readStream = new ReadStream(new Uint8Array(0))

let processServerMessagesSystem = (world: World) => {
  let serverTransport = expect(world.getResource(ServerTransport))
  let networkModel = expect(world.getResource(NetworkModel))
  let message: Maybe<Uint8Array>
  while ((message = serverTransport.recv())) {
    readStream.reset(message)
    let messageType = readStream.readU8()
    switch (messageType) {
      case 0: {
        let termsSize = readStream.readU32()
        let termsHash = HASH_BASE
        for (let i = 0; i < termsSize; i++) {
          let term = readStream.readU32()
          termsHash = hashWord(
            termsHash,
            networkModel.toLocal(term),
          )
        }
        termsHash = normalizeHash(termsHash)
        let type = Type.cache[termsHash]
        if (!exists(type)) {
          let terms = [] as Term[]
          for (let i = 0; i < termsSize; i++) {
            let term = readStream.peekU32(-termsSize + i)
            terms.push(networkModel.toLocal(term))
          }
          type = Type.of(terms)
        }
        let includedSize = readStream.readU32()
        let excludedSize = readStream.readU32()
        for (let i = 0; i < includedSize; i++) {
          let entityId = readStream.readU32()
          let entity = world.qualify(entityId)
          if (exists(entity)) {
            world.add(entity, new Selector(type.components))
          } else {
            world.reserve(entityId, new Selector(type.components))
          }
        }
        for (let i = 0; i < excludedSize; i++) {
          let entityId = readStream.readU32()
          let entity = world.qualify(entityId)
          if (exists(entity)) {
            world.remove(entity, new Selector(type.components))
          }
        }
        break
      }
      default:
        throw new Error(`Unknown message type ${messageType}`)
    }
  }
}

export let clientPlugin = (app: App) => {
  let networkTerms = expect(app.getResource(NetworkConfig))
  let networkModel = new NetworkModelImpl(networkTerms)
  app
    .addResource(NetworkModel, networkModel)
    .addSystemToGroup(Group.Early, processServerMessagesSystem)
}
