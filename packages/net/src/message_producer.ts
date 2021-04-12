import {
  AttachOp,
  Component,
  ComponentType,
  DetachOp,
  mutableEmpty,
  SpawnOp,
  World,
  WorldOp,
  WorldOpType,
} from "@javelin/ecs"
import { createEntityMap } from "./entity_map"
import {
  JavelinMessage,
  protocol,
  UpdatePayload,
  UpdateUnreliable,
  UpdateUnreliablePayload,
} from "./protocol"

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

const entityMapArrayInitializer = (entity: number, value?: any[]) => {
  if (Array.isArray(value)) {
    mutableEmpty(value)
  } else {
    return []
  }

  return value
}

export function createMessageProducer(
  options: MessageProducerOptions,
): MessageProducer {
  const { isLocal = false } = options
  const allComponentTypeIds = options.components.map(config => config.type.type)
  const priorities = new WeakMap<Component, number>()
  const tmpSortedByPriority: Component[] = []
  const tmpEntityMutations = createEntityMap<unknown[]>(
    entityMapArrayInitializer,
  )
  const tmpComponentsByEntity = createEntityMap<Component[]>(
    entityMapArrayInitializer,
  )
  const tmpComponentEntities = new WeakMap<Component, number>()
  const tmpUpdatePayload: UpdatePayload = []
  const tmpUpdateUnreliablePayload: UpdateUnreliablePayload = []

  let previousUnreliableSendTime = 0

  function getInitialMessages(world: World) {
    const messages = []
    const ops: (SpawnOp | AttachOp)[] = []
    const {
      storage: { archetypes },
    } = world

    for (let i = 0; i < archetypes.length; i++) {
      const { signature, entities, table, indices } = archetypes[i]
      const componentIndices = getRelevantIndices(
        signature,
        allComponentTypeIds,
      )

      if (componentIndices.length === 0) {
        continue
      }

      for (let j = 0; j < entities.length; j++) {
        const entity = entities[j]
        const entityIndex = indices[entity]
        const components: Component[] = []
        const spawn: SpawnOp = [WorldOpType.Spawn, entity]
        const attach: AttachOp = [WorldOpType.Attach, entity, components]

        for (let k = 0; k < componentIndices.length; k++) {
          const componentIndex = componentIndices[k]
          const component = table[componentIndex][entityIndex]!
          components.push(component)
        }

        ops.push(spawn, attach)
      }
    }

    if (ops.length > 0) {
      messages.push(protocol.ops(ops, isLocal))
    }

    return messages
  }

  function getReliableMessages(world: World) {
    const storage = world.storage
    const { archetypes } = storage
    const messages: JavelinMessage[] = []

    mutableEmpty(tmpUpdatePayload)

    tmpEntityMutations.clear()

    if (world.ops.length > 0) {
      const filteredOps: WorldOp[] = []

      for (let i = 0; i < world.ops.length; i++) {
        let op = world.ops[i]

        switch (op[0]) {
          case WorldOpType.Attach: {
            const components = op[2].filter(c =>
              allComponentTypeIds.includes(c._tid),
            )

            if (components.length > 0) {
              filteredOps.push([op[0], op[1], components] as WorldOp)
            }

            break
          }
          case WorldOpType.Detach: {
            const componentTypeIds = op[2].filter(component =>
              allComponentTypeIds.includes(component._tid),
            )

            if (componentTypeIds.length > 0) {
              filteredOps.push([op[0], op[1], componentTypeIds] as DetachOp)
            }
            break
          }
          case WorldOpType.Spawn:
            filteredOps.push(op)
            break
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
        const row = archetype.signature.indexOf(type)

        // Not a valid archetype match or unreliable
        if (row === -1 || typeof config.priority === "number") {
          continue
        }

        const components = archetype.table[row]

        for (let k = 0; k < archetype.entities.length; k++) {
          const entity = archetype.entities[k]
          const component = components[archetype.indices[entity]]!

          if (world.isComponentChanged(component)) {
            const entityMutations = tmpEntityMutations[entity]
            const mutations = storage.getComponentMutations(component)

            for (let i = 0; i < mutations.length; i++) {
              entityMutations.push(mutations[i] as any)
            }
          }
        }
      }
    }

    tmpEntityMutations.forEach((entity, value) => {
      tmpUpdatePayload.push(entity)

      for (let i = 0; i < value.length; i++) {
        tmpUpdatePayload.push(value[i])
      }
    })

    if (tmpUpdatePayload.length > 0) {
      messages.push(protocol.update(tmpUpdatePayload))
    }

    return messages
  }

  function getUnreliableMessages(world: World): UpdateUnreliable[] {
    const time = Date.now()
    const {
      storage: { archetypes },
    } = world

    if (time - previousUnreliableSendTime < options.updateInterval) {
      return []
    }

    previousUnreliableSendTime = time

    tmpComponentsByEntity.clear()

    mutableEmpty(tmpUpdateUnreliablePayload)
    mutableEmpty(tmpSortedByPriority)

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]

      for (let j = 0; j < options.components.length; j++) {
        const config = options.components[j]
        const { type } = config.type

        // Skip reliable components
        if (typeof config.priority !== "number") {
          continue
        }

        const row = archetype.signature.indexOf(type)

        // Not a valid archetype match
        if (row === -1) {
          continue
        }

        const components = archetype.table[row]

        for (let k = 0; k < archetype.entities.length; k++) {
          const entity = archetype.entities[k]
          const component = components[archetype.indices[entity]]
          tmpComponentEntities.set(component, entity)
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
      const entity = tmpComponentEntities.get(component)!
      const entityComponents = tmpComponentsByEntity[entity]

      entityComponents.push(component)
    }

    tmpComponentsByEntity.forEach((entity, components) => {
      tmpUpdateUnreliablePayload.push(entity)

      for (let i = 0; i < components.length; i++) {
        tmpUpdateUnreliablePayload.push(components[i])
      }
    })

    return [protocol.updateUnreliable(tmpUpdateUnreliablePayload)]
  }

  return {
    getInitialMessages,
    getReliableMessages,
    getUnreliableMessages,
  }
}
