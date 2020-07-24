import {
  changed,
  Component,
  ComponentType,
  mutableEmpty,
  World,
  WorldOpType,
  CreateOp,
  WorldOp,
  $worldStorageKey,
} from "@javelin/ecs"
import { JavelinMessage, protocol, Update } from "./protocol"

export type QueryConfig = {
  type: ComponentType
  priority?: number
}

export type MessageProducer = {
  getInitialMessages(world: World): JavelinMessage[]
  getReliableMessages(world: World): JavelinMessage[]
  getUnreliableMessages(world: World): Update[]
}

export type MessageProducerOptions = {
  components: QueryConfig[]
  updateInterval: number
  updateSize: number
  isLocal?: boolean
}

function getRelevantIndices<T>(a: ReadonlyArray<T>, b: ReadonlyArray<T>) {
  const result = []

  for (let i = 0; i < a.length; i++) {
    if (b.includes(a[i])) {
      result.push(i)
    }
  }
  return result
}

export function createMessageProducer(
  options: MessageProducerOptions,
): MessageProducer {
  const { isLocal = false } = options
  const allComponentTypeIds = options.components.map(config => config.type.type)
  const priorities = new WeakMap<Component, number>()
  const payloadChanged: Component[] = []
  const changedCache = changed()
  const tempSortedByPriority: Component[] = []

  let previousUnreliableSendTime = 0

  function getInitialMessages(world: World) {
    const messages = []
    const ops: CreateOp[] = []
    const { archetypes } = world[$worldStorageKey]

    for (let i = 0; i < archetypes.length; i++) {
      const { layout, entities, table, indices } = archetypes[i]
      const componentIndices = getRelevantIndices(layout, allComponentTypeIds)

      if (componentIndices.length === 0) {
        continue
      }

      for (let j = 0; j < entities.length; j++) {
        const entity = entities[j]

        if (world.destroyed.has(entity)) {
          continue
        }

        const entityIndex = indices[entity]
        const components: Component[] = []
        const message: CreateOp = [WorldOpType.Create, entity, components]

        for (let k = 0; k < componentIndices.length; k++) {
          const componentIndex = componentIndices[k]
          components.push(table[componentIndex][entityIndex]!)
        }

        ops.push(message)
      }
    }

    if (ops.length > 0) {
      messages.push(protocol.ops(ops, isLocal))
    }

    return messages
  }

  function getReliableMessages(world: World) {
    const { archetypes } = world[$worldStorageKey]
    const messages: JavelinMessage[] = []

    if (world.ops.length > 0) {
      const filteredOps: WorldOp[] = []

      for (let i = 0; i < world.ops.length; i++) {
        let op = world.ops[i]

        switch (op[0]) {
          case WorldOpType.Create:
          case WorldOpType.Insert:
          case WorldOpType.Remove: {
            const components = op[2].filter(c =>
              allComponentTypeIds.includes(c._t),
            )

            if (components.length > 0) {
              filteredOps.push([op[0], op[1], components, op[3]] as WorldOp)
            }

            break
          }
          case WorldOpType.Destroy:
            filteredOps.push(op)
            break
        }
      }

      if (filteredOps.length > 0) {
        messages.push(protocol.ops(filteredOps, isLocal))
      }
    }

    mutableEmpty(payloadChanged)

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]

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

          if (
            typeof config.priority !== "number" &&
            changedCache.matchComponent(component, world)
          ) {
            payloadChanged.push(component)
          }
        }
      }
    }

    if (payloadChanged.length > 0)
      messages.push(protocol.update(payloadChanged))

    return messages
  }

  function getUnreliableMessages(world: World): Update[] {
    const time = Date.now()
    const {
      [$worldStorageKey]: { archetypes },
    } = world

    if (time - previousUnreliableSendTime < options.updateInterval) {
      return []
    }

    previousUnreliableSendTime = time

    mutableEmpty(tempSortedByPriority)

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]

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
