import { Component, ComponentWithoutEntity, World } from "@javelin/ecs"
import { JavelinMessage, JavelinMessageType } from "./protocol"

export type MessageHandler = {
  applyMessage: (message: JavelinMessage) => void
  remoteToLocal: Map<number, number>
}

export function createMessageHandler(world: World): MessageHandler {
  const remoteToLocal = new Map<number, number>()

  function handleCreateMessage(components: Component[]) {
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
      const local = world.create(components)
      remoteToLocal.set(entity, local)
    }
  }

  function destroyEntity(entity: number) {
    const local = remoteToLocal.get(entity)

    if (typeof local !== "number") {
      return
    }

    remoteToLocal.delete(entity)
    world.destroy(local)
  }

  function updateComponent(component: Component) {
    const local = remoteToLocal.get(component._e)

    if (local === undefined) {
      return
    }

    world.storage.patch({ ...component, _e: local })
  }

  function handleSpawnMessage(components: ComponentWithoutEntity[]) {
    world.create(components)
  }

  function applyMessage(message: JavelinMessage) {
    switch (message[0]) {
      case JavelinMessageType.Create:
        handleCreateMessage(message[1])
        break
      case JavelinMessageType.Destroy:
        message[1].forEach(destroyEntity)
        break
      case JavelinMessageType.Update:
        message[1].forEach(updateComponent)
        break
      case JavelinMessageType.Spawn:
        handleSpawnMessage(message[1])
        break
    }
  }

  return {
    applyMessage,
    remoteToLocal,
  }
}
