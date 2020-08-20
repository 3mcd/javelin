import {
  $worldStorageKey,
  Component,
  ComponentPatch,
  ComponentType,
  DetachOp,
  mutableEmpty,
  SpawnOp,
  Storage,
  World,
  WorldOp,
  WorldOpType,
} from "@javelin/ecs"
import {
  JavelinMessage,
  protocol,
  UpdatePayload,
  UpdateUnreliable,
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

export function createMessageProducer(
  options: MessageProducerOptions,
): MessageProducer {
  const { isLocal = false } = options
  const allComponentTypeIds = options.components.map(config => config.type.type)
  const priorities = new WeakMap<Component, number>()
  const tmpSortedByPriority: Component[] = []
  const tmpComponentMutationsByEntity = new Map<
    number,
    (number | ComponentPatch)[]
  >()
  const tmpEntitiesByComponent = new WeakMap<Component, number>()

  let previousUnreliableSendTime = 0

  function captureMutations(
    world: World,
    storage: Storage,
    entity: number,
    component: Component,
  ) {
    if (world.isComponentChanged(component)) {
      let entityMutations = tmpComponentMutationsByEntity.get(entity)

      if (!entityMutations) {
        entityMutations = []
        tmpComponentMutationsByEntity.set(entity, entityMutations)
      }

      const mutations = storage.getComponentMutations(component)

      entityMutations.push(component.type)

      for (let i = 0; i < mutations.length; i++) {
        entityMutations.push(mutations[i] as any)
      }
    }
  }

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

          if (!world.detached.has(component)) {
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
    const storage = world[$worldStorageKey]
    const { archetypes } = storage
    const messages: JavelinMessage[] = []

    tmpComponentMutationsByEntity.clear()

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
        const row = archetype.layout.indexOf(type)

        // Not a valid archetype match or unreliable
        if (row === -1 || typeof config.priority === "number") {
          continue
        }

        const components = archetype.table[row]

        for (let k = 0; k < archetype.entities.length; k++) {
          const entity = archetype.entities[k]
          const component = components[archetype.indices[entity]]!

          captureMutations(world, storage, entity, component)
        }
      }
    }

    const payload: UpdatePayload = []

    for (const [entity, patch] of tmpComponentMutationsByEntity.entries()) {
      payload.push(entity)

      for (let i = 0; i < patch.length; i++) {
        payload.push(patch[i])
      }
    }

    if (payload.length > 0) {
      messages.push(protocol.update(payload))
    }

    return messages
  }

  function getUnreliableMessages(world: World): UpdateUnreliable[] {
    const time = Date.now()
    const storage = world[$worldStorageKey]
    const { archetypes } = storage

    if (time - previousUnreliableSendTime < options.updateInterval) {
      return []
    }

    previousUnreliableSendTime = time

    mutableEmpty(tmpSortedByPriority)
    tmpComponentMutationsByEntity.clear()

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

      captureMutations(world, storage, entity, component)
    }

    const payload: UpdatePayload = []

    for (const [entity, patch] of tmpComponentMutationsByEntity.entries()) {
      payload.push(entity)

      for (let i = 0; i < patch.length; i++) {
        payload.push(patch[i])
      }
    }

    return [protocol.updateUnreliable(payload)]
  }

  return {
    getInitialMessages,
    getReliableMessages,
    getUnreliableMessages,
  }
}
