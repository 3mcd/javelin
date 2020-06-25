import { Component, ComponentWithoutEntity, World } from "@javelin/ecs"
import { JavelinMessage, JavelinMessageType } from "./protocol"

export type MessageHandler = {
  applyMessage: (message: JavelinMessage) => void
  remoteToLocal: Map<number, number>
}

export function createMessageHandler(world: World): MessageHandler {
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

  function destroyEntity(entity: number, isLocal: boolean) {
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

  function updateComponent(component: Component) {
    const local = remoteToLocal.get(component._e)

    if (local === undefined) {
      return
    }

    world.storage.patch({ ...component, _e: local })
  }

  function spawn(components: ComponentWithoutEntity[]) {
    world.create(components)
  }

  function destroyRemote(entities: number[]) {
    entities.forEach(world.destroy)
  }

  function applyMessage(message: JavelinMessage) {
    switch (message[0]) {
      case JavelinMessageType.Create:
        create(message[1], message[2])
        break
      case JavelinMessageType.Destroy:
        message[1].forEach(e => destroyEntity(e, message[2]))
        break
      case JavelinMessageType.Update:
        message[1].forEach(updateComponent)
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
