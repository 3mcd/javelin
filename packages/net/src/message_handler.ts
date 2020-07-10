import { Component, ComponentSpec, World } from "@javelin/ecs"
import { JavelinMessage, JavelinMessageType } from "./protocol"

export type MessageHandler = {
  applyMessage: (message: JavelinMessage) => void
  remoteToLocal: Map<number, number>
}

export type MessageHandlerOptions = {
  world: World
}

export function createMessageHandler(
  options: MessageHandlerOptions,
): MessageHandler {
  const { world } = options
  const remoteToLocal = new Map<number, number>()

  function create(components: Component[], isLocal: boolean) {
    const componentsByEntity = new Map<number, Component[]>()

    components.forEach(c => {
      let components = componentsByEntity.get(c._e)

      if (!components) {
        components = [c]
        componentsByEntity.set(c._e, components)
      } else {
        components.push(c)
      }

      return componentsByEntity
    })

    for (const [entity, components] of componentsByEntity) {
      if (isLocal) {
        world.storage.create(entity, components)
      } else {
        const local = world.create(components)
        remoteToLocal.set(entity, local)
      }
    }
  }

  function destroyAll(entities: number[], isLocal: boolean) {
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]
      const local = isLocal ? entity : remoteToLocal.get(entity)
      const present =
        local &&
        Boolean(world.storage.archetypes.find(a => a.entities.includes(local)))

      if (!present) {
        return
      }

      remoteToLocal.delete(entity)
      world.destroy(local!)
    }
  }

  function updateAll(components: Component[], isLocal: boolean) {
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const entity = component._e
      const local = isLocal ? entity : remoteToLocal.get(entity)

      if (local === undefined) {
        return
      }

      world.storage.patch({ ...component, _e: local })
    }
  }

  function spawn(components: ComponentSpec[]) {
    world.create(components)
  }

  function applyMessage(message: JavelinMessage) {
    switch (message[0]) {
      case JavelinMessageType.Create:
        create(message[1], message[2])
        break
      case JavelinMessageType.Destroy:
        destroyAll(message[1], message[2])
        break
      case JavelinMessageType.Update:
        updateAll(message[1], message[2])
        break
      case JavelinMessageType.Spawn:
        spawn(message[1])
        break
    }
  }

  return {
    applyMessage,
    remoteToLocal,
  }
}
