import {
  changed,
  Component,
  ComponentType,
  created,
  createQuery,
  destroyed,
  mutableEmpty,
  World,
  createWorld,
} from "@javelin/ecs"
import { JavelinMessage, protocol, Update } from "./protocol"

export type QueryConfig = {
  type: ComponentType
  priority?: number
}

export type MessageProducer = {
  getInitialMessages(): JavelinMessage[]
  getReliableMessages(): JavelinMessage[]
  getUnreliableMessages(): Update[]
}

export type MessageProducerOptions = {
  world: World
  components: QueryConfig[]
  updateInterval: number
  updateSize: number
  isLocal?: boolean
}

export function createMessageProducer(
  options: MessageProducerOptions,
): MessageProducer {
  const { isLocal = false, world } = options
  const priorities = new WeakMap<Component, number>()
  const payloadCreated: Component[] = []
  const payloadChanged: Component[] = []
  const payloadDestroyed: number[] = []
  const changedCache = changed()
  const tempSortedByPriority: Component[] = []

  function getInitialMessages() {
    const messages: JavelinMessage[] = []

    mutableEmpty(payloadCreated)

    for (let i = 0; i < world.storage.archetypes.length; i++) {
      const archetype = world.storage.archetypes[i]

      for (let j = 0; j < options.components.length; j++) {
        const config = options.components[j]
        const { type } = config.type
        const row = archetype.layout.indexOf(type)

        // Not a valid archetype match
        if (row === -1) {
          continue
        }

        const components = archetype.table[row]

        for (let k = 0; k < archetype.entities.length; k++) {
          const entity = archetype.entities[k]

          if (world.destroyed.has(entity)) {
            continue
          }

          const component = components[archetype.indices[entity]]!

          payloadCreated.push(component)
        }
      }
    }

    if (payloadCreated.length > 0)
      messages.push(protocol.create(payloadCreated, isLocal))

    return messages
  }

  function getReliableMessages() {
    const messages: JavelinMessage[] = []

    mutableEmpty(payloadCreated)
    mutableEmpty(payloadChanged)
    mutableEmpty(payloadDestroyed)

    for (let i = 0; i < world.storage.archetypes.length; i++) {
      const archetype = world.storage.archetypes[i]

      for (let j = 0; j < options.components.length; j++) {
        const config = options.components[j]
        const { type } = config.type
        const row = archetype.layout.indexOf(type)

        // Not a valid archetype match
        if (row === -1) {
          continue
        }

        const components = archetype.table[row]

        for (let k = 0; k < archetype.entities.length; k++) {
          const entity = archetype.entities[k]
          const component = components[archetype.indices[entity]]!

          if (world.created.has(entity)) {
            payloadCreated.push(component)
          } else if (world.destroyed.has(entity)) {
            payloadDestroyed.push(entity)
          } else if (
            typeof config.priority !== "number" &&
            changedCache.matchComponent(component, world)
          ) {
            payloadChanged.push(component)
          }
        }
      }
    }

    if (payloadCreated.length > 0)
      messages.push(protocol.create(payloadCreated, isLocal))
    if (payloadChanged.length > 0)
      messages.push(protocol.update(payloadChanged))
    if (payloadDestroyed.length > 0)
      messages.push(protocol.destroy(payloadDestroyed, isLocal))

    return messages
  }

  let previousUnreliableSendTime = 0

  function getUnreliableMessages(): Update[] {
    const time = Date.now()

    if (time - previousUnreliableSendTime < options.updateInterval) {
      return []
    }

    previousUnreliableSendTime = time

    mutableEmpty(tempSortedByPriority)

    for (let i = 0; i < world.storage.archetypes.length; i++) {
      const archetype = world.storage.archetypes[i]

      for (let j = 0; j < options.components.length; j++) {
        const config = options.components[j]
        const { type } = config.type

        // Unreliable component
        if (typeof config.priority !== "number") {
          continue
        }

        const row = archetype.layout.indexOf(type)

        // Not a valid archetype match
        if (row === -1) {
          continue
        }

        const components = archetype.table[row]

        for (let k = 0; k < archetype.entities.length; k++) {
          const entity = archetype.entities[k]
          const component = components[archetype.indices[entity]]!

          tempSortedByPriority.push(component)
        }
      }
    }

    tempSortedByPriority.sort((a, b) => priorities.get(a)! - priorities.get(b)!)

    for (let i = tempSortedByPriority.length - 1; i >= 0; i--) {
      if (i > options.updateSize) {
        tempSortedByPriority.pop()
      } else {
        priorities.delete(tempSortedByPriority[i])
      }
    }

    return [protocol.update(tempSortedByPriority)]
  }

  return {
    getInitialMessages,
    getReliableMessages,
    getUnreliableMessages,
  }
}
