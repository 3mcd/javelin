import { World } from "@javelin/ecs"
import { NetworkMessage, NetworkMessageType } from "./protocol"

export function createMessageHandler(world: World) {
  const remoteToLocal = new Map<number, number>()

  function applyMessage(message: NetworkMessage) {
    switch (message[0]) {
      case NetworkMessageType.Create: {
        const entityComponents = message[1]

        for (let i = 0; i < entityComponents.length; i++) {
          const components = entityComponents[i]
          const remote = components[0]._e
          const local = world.create(components.map(c => ({ ...c })))

          remoteToLocal.set(remote, local)
        }
        break
      }
      case NetworkMessageType.Destroy: {
        const entities = message[1]

        for (let i = 0; i < entities.length; i++) {
          const remote = entities[i]
          const local = remoteToLocal.get(remote)

          if (typeof local !== "number") {
            continue
          }

          remoteToLocal.delete(remote)
          world.destroy(local)
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

          world.storage.patch({ ...component, _e: local })
        }
        break
    }
  }

  return {
    applyMessage,
    remoteToLocal,
  }
}
