import { NetworkMessage, NetworkMessageType } from "./protocol"
import { Storage } from "@javelin/ecs"

export function createMessageHandler(storage: Storage) {
  const remoteToLocal = new Map<number, number>()

  function applyMessage(message: NetworkMessage) {
    switch (message[0]) {
      case NetworkMessageType.Create: {
        const entityComponents = message[1]

        for (let i = 0; i < entityComponents.length; i++) {
          const components = entityComponents[i]
          const remote = components[0]._e
          const local = storage.create(components.map(c => ({ ...c })))

          remoteToLocal.set(remote, local)
        }
        break
      }
      case NetworkMessageType.Remove: {
        const entities = message[1]

        for (let i = 0; i < entities.length; i++) {
          const remote = entities[i]
          const local = remoteToLocal.get(remote)

          if (!local) {
            continue
          }

          remoteToLocal.delete(remote)
          storage.destroy(local)
        }
        break
      }
      case NetworkMessageType.Update:
        const components = message[1]

        for (let i = 0; i < components.length; i++) {
          const component = components[i]
          const local = remoteToLocal.get(component._e)

          if (!local) {
            continue
          }

          storage.patch({ ...component, _e: local })
        }
        break
    }
  }

  return {
    applyMessage,
    remoteToLocal,
  }
}
