import {
  $worldStorageKey,
  Component,
  ComponentType,
  DetachOp,
  mutableEmpty,
  SpawnOp,
  World,
  WorldOp,
  WorldOpType,
} from "@javelin/ecs"
import { JavelinMessage, protocol, UpdateUnreliable } from "./protocol"

export type QueryConfig = {
  type: ComponentType
  priority?: number
}

export type MessageProducer = {
  getInitialMessages(world: World): JavelinMessage[]
  getReliableMessages(world: World): JavelinMessage[]
  getUnreliableMessages(world: World): UpdateUnreliable[]
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
  const changedCache = new WeakMap<Component, number>()
  const tmpSortedByPriority: Component[] = []

  let previousUnreliableSendTime = 0

  function getInitialMessages(world: World) {
    const messages = []
    const ops: SpawnOp[] = []
    const { archetypes } = world[$worldStorageKey]

    for (let i = 0; i < archetypes.length; i++) {
      const { layout, entities, table, indices } = archetypes[i]
      const componentIndices = getRelevantIndices(layout, allComponentTypeIds)

      if (componentIndices.length === 0) {
        continue
      }

      for (let j = 0; j < entities.length; j++) {
        const entity = entities[j]
        const entityIndex = indices[entity]
        const components: Component[] = []
        const message: SpawnOp = [WorldOpType.Spawn, entity, components]

        for (let k = 0; k < componentIndices.length; k++) {
          const componentIndex = componentIndices[k]
          const component = table[componentIndex][entityIndex]!

          if (component._v > -1) {
            components.push(table[componentIndex][entityIndex]!)
          }
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

    tmpComponentsByEntity.clear()

    if (world.ops.length > 0) {
      const filteredOps: WorldOp[] = []

      for (let i = 0; i < world.ops.length; i++) {
        let op = world.ops[i]

        switch (op[0]) {
          case WorldOpType.Spawn:
          case WorldOpType.Attach: {
            const components = op[2].filter(c =>
              allComponentTypeIds.includes(c._t),
            )

            if (components.length > 0) {
              filteredOps.push([op[0], op[1], components] as WorldOp)
            }

            break
          }
          case WorldOpType.Detach: {
            const componentTypeIds = op[2].filter(_t =>
              allComponentTypeIds.includes(_t),
            )

            if (componentTypeIds.length > 0) {
              filteredOps.push([op[0], op[1], componentTypeIds] as DetachOp)
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

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]

      for (let j = 0; j < options.components.length; j++) {
        const config = options.components[j]
        const { type } = config.type
        const row = archetype.layout.indexOf(type)

        // Not a valid archetype match or unreliable
        if (row === -1 || typeof config.priority === "number") {
          continue
        }

        const components = archetype.table[row]

        for (let k = 0; k < archetype.entities.length; k++) {
          const entity = archetype.entities[k]
          const component = components[archetype.indices[entity]]!
          const last = changedCache.get(component)
          const hit = component._v > (last === undefined ? -1 : last)

          if (hit) {
            let arr = tmpComponentsByEntity.get(entity)

            if (!arr) {
              arr = []
              tmpComponentsByEntity.set(entity, arr)
            }

            arr.push(component)
            changedCache.set(component, component._v)
          }
        }
      }
    }

    if (payloadChanged.length > 0)
      messages.push(
        protocol.update(Array.from(tmpComponentsByEntity.entries())),
      )

    return messages
  }

  const tmpComponentsByEntity = new Map<number, Component[]>()
  const tmpEntitiesByComponent = new WeakMap<Component, number>()

  function getUnreliableMessages(world: World): UpdateUnreliable[] {
    const time = Date.now()
    const {
      [$worldStorageKey]: { archetypes },
    } = world

    if (time - previousUnreliableSendTime < options.updateInterval) {
      return []
    }

    previousUnreliableSendTime = time

    mutableEmpty(tmpSortedByPriority)
    tmpComponentsByEntity.clear()

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]

      for (let j = 0; j < options.components.length; j++) {
        const config = options.components[j]
        const { type } = config.type

        // Skip reliable components
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

          tmpEntitiesByComponent.set(component, entity)
          tmpSortedByPriority.push(component)
        }
      }
    }

    tmpSortedByPriority.sort((a, b) => priorities.get(a)! - priorities.get(b)!)

    for (let i = tmpSortedByPriority.length - 1; i >= 0; i--) {
      if (i > options.updateSize) {
        tmpSortedByPriority.pop()
      } else {
        priorities.delete(tmpSortedByPriority[i])
      }
    }

    for (let i = 0; i < tmpSortedByPriority.length; i++) {
      const component = tmpSortedByPriority[i]
      const entity = tmpEntitiesByComponent.get(component)!
      let arr = tmpComponentsByEntity.get(entity)

      if (!arr) {
        arr = []
        tmpComponentsByEntity.set(entity, arr)
      }

      arr.push(component)
    }

    return [
      protocol.updateUnreliable(Array.from(tmpComponentsByEntity.entries())),
    ]
  }

  return {
    getInitialMessages,
    getReliableMessages,
    getUnreliableMessages,
  }
}
