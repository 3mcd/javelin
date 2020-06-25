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
  getUnreliableMessages<T>(metadata: T[]): Update<T>[]
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
  const { isLocal = false } = options
  const priorities = new WeakMap<Component, number>()
  const payloadCreated: Component[] = []
  const payloadChanged: Component[] = []
  const payloadDestroyed: number[] = []
  const changedCache = changed()
  const tempSortedByPriority: Component[] = []

  function getInitialMessages() {
    const messages: JavelinMessage[] = []

    mutableEmpty(payloadCreated)

    for (let i = 0; i < options.world.storage.archetypes.length; i++) {
      const archetype = options.world.storage.archetypes[i]

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

          payloadCreated.push(component)
        }
      }
    }

    if (payloadCreated.length > 0)
      messages.push(protocol.create(payloadCreated))

    return messages
  }

  function getReliableMessages() {
    const messages: JavelinMessage[] = []

    mutableEmpty(payloadCreated)
    mutableEmpty(payloadChanged)
    mutableEmpty(payloadDestroyed)

    for (let i = 0; i < options.world.storage.archetypes.length; i++) {
      const archetype = options.world.storage.archetypes[i]

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

          if (options.world.created.has(entity)) {
            payloadCreated.push(component)
          } else if (options.world.destroyed.has(entity)) {
            payloadDestroyed.push(entity)
          } else if (
            typeof config.priority !== "number" &&
            changedCache.matchComponent(component, options.world)
          ) {
            payloadChanged.push(component)
          }
        }
      }
    }

    if (payloadCreated.length > 0)
      messages.push(protocol.create(payloadCreated, isLocal))
    if (payloadChanged.length > 0)
      messages.push(protocol.change(payloadChanged))
    if (payloadDestroyed.length > 0)
      messages.push(protocol.destroy(payloadDestroyed, isLocal))

    return messages
  }

  let previousUnreliableSendTime = 0

  function getUnreliableMessages<T>(metadata: T[]): Update<T>[] {
    const time = Date.now()

    if (time - previousUnreliableSendTime < options.updateInterval) {
      return []
    }

    previousUnreliableSendTime = time

    mutableEmpty(tempSortedByPriority)

    for (let i = 0; i < options.world.storage.archetypes.length; i++) {
      const archetype = options.world.storage.archetypes[i]

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

    return metadata.map(m => protocol.update(tempSortedByPriority, m))
  }

  return {
    getInitialMessages,
    getReliableMessages,
    getUnreliableMessages,
  }
}

// // function createMessageFactory<
// //   Fn extends (components: Component[]) => JavelinMessage
// // >(
// //   create: Fn,
// //   queries: QueryLike<ComponentType[]>[],
// //   encode: NetworkMessageEncoder,
// // ): (world: World) => ReturnType<Fn> {
// //   const payload: Component[] = []

// //   return function messageFactory(world: World) {
// //     mutableEmpty(payload)

// //     for (const query of queries) {
// //       for (const [c] of world.query(query)) {
// //         payload.push(c)
// //       }
// //     }

// //     return payload.length > 0 && encode(create(payload))
// //   }
// // }

// // export function createMessageProducer(config: ProducerConfig) {
// // const { entities, updateInterval, updateSize } = config
// // const all = config.components.map(c => c.type)
// // const componentTypesReliable = config.components
// //   .filter(c => typeof c.priority !== "number")
// //   .map(c => c.type)
// // const unreliableConfig = config.components.filter(
// //   c => typeof c.priority === "number" && c.priority > 0,
// // )
// // const unreliableQuery = unreliableConfig.map(c => createQuery(c.type))
// // const unreliablePayload: Component[] = []
// // const priorities = createPriorityAccumulator(
// //   new Map(unreliableConfig.map(c => [c.type.type, c.priority!])),
// // )
// // let previousSendTime = 0
// // function* unreliable(world: World, time = Date.now()) {
// //   mutableEmpty(unreliablePayload)
// //   for (const query of unreliableQuery) {
// //     for (const [c] of world.query(query)) {
// //       priorities.update(c)
// //     }
// //   }
// //   if (time - previousSendTime < unreliableSendRate) {
// //     return
// //   }
// //   previousSendTime = time
// //   let i = maxUpdateSize
// //   for (const c of priorities) {
// //     unreliablePayload.push(c)
// //     if (--i <= 0) break
// //   }
// //   let metadata
// //   while ((metadata = yield protocol.update(unreliablePayload, metadata))) {
// //     yield protocol.update(unreliablePayload, metadata)
// //   }
// // }
// // return {
// //   init: createMessageFactory(
// //     protocol.create,
// //     all.map(c => createQuery(c)),
// //     encode,
// //   ),
// //   created: createMessageFactory(
// //     protocol.create,
// //     all.map(c => createQuery(c).filter(created)),
// //     encode,
// //   ),
// //   changed: createMessageFactory(
// //     protocol.change,
// //     componentTypesReliable.map(c => createQuery(c).filter(changed)),
// //     encode,
// //   ),
// //   destroyed: createMessageFactory(
// //     result => protocol.destroy(result.map(c => c._e)),
// //     all.map(c => createQuery(c).filter(destroyed)),
// //     encode,
// //   ),
// //   unreliable,
// // }
// // }
