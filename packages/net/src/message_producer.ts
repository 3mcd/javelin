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
  const tmpReadIndices: number[] = []
  const tmpComponentEntities = new WeakMap<Component, number>()
  const tmpUpdatePayload: UpdatePayload = []
  const tmpUpdateUnreliablePayload: UpdateUnreliablePayload = []

  let previousUnreliableSendTime = 0

  function getInitialMessages(world: World) {
    const messages = []
    const ops: SpawnOp[] = []
    const { archetypes } = world[$worldStorageKey]

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]

      mutableEmpty(tmpReadIndices)

      for (let i = 0; i < allComponentTypeIds.length; i++) {
        const componentTypeId = allComponentTypeIds[i]
        const index = archetype.indexByType[componentTypeId]

        if (typeof index === "number") {
          tmpReadIndices.push(index)
        }
      }

      archetype.forEach((entity, components) => {
        const messageComponents: Component[] = []
        const message: SpawnOp = [WorldOpType.Spawn, entity, messageComponents]

        for (let i = 0; i < tmpReadIndices.length; i++) {
          const readIndex = tmpReadIndices[i]
          const component = components[readIndex]

          if (component.state === 0) {
            messageComponents.push(component)
          }
        }

        ops.push(message)
      })
    }

    if (ops.length > 0) {
      messages.push(protocol.ops(ops, isLocal))
    }

    return messages
  }

  function getReliableMessages(world: World) {
    const storage = world[$worldStorageKey]
    const { archetypes } = storage
    const messages: JavelinMessage[] = []

    mutableEmpty(tmpUpdatePayload)

    tmpEntityMutations.clear()

    if (world.ops.length > 0) {
      const filteredOps: WorldOp[] = []

      for (let i = 0; i < world.ops.length; i++) {
        let op = world.ops[i]

        switch (op[0]) {
          case WorldOpType.Spawn:
          case WorldOpType.Attach: {
            const components = op[2].filter(c =>
              allComponentTypeIds.includes(c.type),
            )

            if (components.length > 0) {
              filteredOps.push([op[0], op[1], components] as WorldOp)
            }

            break
          }
          case WorldOpType.Detach: {
            const componentTypeIds = op[2].filter(type =>
              allComponentTypeIds.includes(type),
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
        const componentIndex = archetype.indexByType[type]

        // Not a valid archetype match or unreliable
        if (
          componentIndex === undefined ||
          typeof config.priority === "number"
        ) {
          continue
        }

        for (let i = 0; i < archetype.entities.length; i++) {
          const entity = archetype.entities[i]
          const component = archetype.getByType(entity, type)

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
      [$worldStorageKey]: { archetypes },
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

        const index = archetype.indexByType[type]

        // Not a valid archetype match
        if (index === undefined) {
          continue
        }

        for (let k = 0; k < archetype.entities.length; k++) {
          const entity = archetype.entities[k]
          const component = archetype.getByType(entity, type)

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
