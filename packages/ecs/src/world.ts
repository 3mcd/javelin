import { assert, mutableEmpty, Schema } from "@javelin/core"
import {
  $pool,
  Component,
  ComponentOf,
  getSchemaId,
  registerSchema,
} from "./component"
import { Entity } from "./entity"
import { UNSAFE_internals } from "./internal"
import { createStorage, Storage, StorageSnapshot } from "./storage"
import { Topic } from "./topic"

const $systemId = Symbol("javelin_system_id")

export enum DeferredOpType {
  Create,
  Attach,
  Detach,
  Destroy,
}

export type Create = [DeferredOpType.Create, number, Component[]]
export type Attach = [DeferredOpType.Attach, number, Component[]]
export type Detach = [DeferredOpType.Detach, number, number[]]
export type Destroy = [DeferredOpType.Destroy, number]

export type WorldOp = Create | Attach | Detach | Destroy
export type World<$Tick = unknown> = {
  /**
   * Unique world identifier.
   */
  readonly id: number

  /**
   * Entity-component storage.
   */
  readonly storage: Storage

  /**
   * Latest step number.
   */
  readonly latestTick: number

  /**
   * Latest step data passed to world.step().
   */
  readonly latestTickData: $Tick

  /**
   * Id of the latest invoked system.
   */
  readonly latestSystemId: number

  /**
   * Process deferred operations from previous step and execute all systems.
   * @param data Step data
   */
  step(data: $Tick): void

  /**
   * Register a system to be executed each step.
   * @param system
   */
  addSystem(system: System<$Tick>): void

  /**
   * Remove a system.
   * @param system
   */
  removeSystem(system: System<$Tick>): void

  /**
   * Register a topic to be flushed each step.
   * @param topic
   */
  addTopic(topic: Topic): void

  /**
   * Remove a topic.
   * @param topic
   */
  removeTopic(topic: Topic): void

  /**
   * Create an entity and optionally attach components.
   * @param components The new entity's components
   */
  create(...components: ReadonlyArray<Component>): Entity

  /**
   * Attach components to an entity. Deferred until next tick.
   * @param entity Entity
   * @param components Components to attach to `entity`
   */
  attach(entity: Entity, ...components: ReadonlyArray<Component>): void

  /**
   * Attach components to an entity.
   * @param entity Entity
   * @param components Components to attach to `entity`
   */
  attachImmediate(entity: Entity, components: Component[]): void

  /**
   * Remove attached components from an entity. Deffered until next tick.
   * @param entity Entity
   * @param components Components to detach from `entity`
   */
  detach(entity: Entity, ...components: (Schema | Component | number)[]): void

  /**
   * Remove attached components from an entity.
   * @param entity Entity
   * @param components Components to detach from `entity`
   */
  detachImmediate(entity: Entity, schemaIds: number[]): void

  /**
   * Remove all components from an entity. Deferred until next tick.
   * @param entity Entity
   */
  destroy(entity: Entity): void

  /**
   * Remove all components from an entity.
   * @param entity Entity
   */
  destroyImmediate(entity: Entity): void

  /**
   * Find the component of an entity by type. Throws an error if component is not found.
   * @param entity
   * @param schema
   */
  get<$Tick extends Schema>(entity: Entity, schema: $Tick): ComponentOf<$Tick>

  /**
   * Find the component of an entity by type, or null if a component is not found.
   * @param entity
   * @param schema
   */
  tryGet<$Tick extends Schema>(
    entity: Entity,
    schema: $Tick,
  ): ComponentOf<$Tick> | null

  /**
   * Check if an entity has a component of a specified schema.
   * @param entity
   * @param schema
   */
  has(entity: Entity, schema: Schema): boolean

  /**
   * Reset the world to its initial state, removing all entities, components,
   * systems, topics, and deferred operations.
   */
  reset(): void

  /**
   * Create a serializable snapshot of the world that can be restored later.
   */
  createSnapshot(): WorldSnapshot
}

/**
 * A JSON-serializable world.
 */
export type WorldSnapshot = {
  storage: StorageSnapshot
}

/**
 * A function executed each tick. Systems are passed the world which executed
 * them as their first and only parameter. They can call effects in their
 * implementations.
 */
export type System<$Tick> = ((world: World<$Tick>) => void) & {
  [$systemId]?: number
}

export type WorldOptions<$Tick> = {
  /**
   * Initial number of components in a component pool. Can be overriden
   * for a specific component type via an argument passed to `registerSchema`.
   */
  componentPoolSize?: number
  /**
   * Snapshot to restore world from.
   */
  snapshot?: WorldSnapshot
  /**
   * Systems to execute each step.
   */
  systems?: System<$Tick>[]
  /**
   * Topics to flush at the end of each step.
   */
  topics?: Topic[]
}

/**
 * Create a world.
 * @param options WorldOptions
 * @returns World
 */
export function createWorld<$Tick = void>(
  options: WorldOptions<$Tick> = {},
): World<$Tick> {
  const { topics = [] } = options
  const systems: System<$Tick>[] = []
  const deferredOps: WorldOp[] = []
  const destroyed = new Set<number>()
  const storage = createStorage({ snapshot: options.snapshot?.storage })

  let entityIds = 0
  let systemIds = 0

  options.systems?.forEach(addSystem)

  function createDeferredOp<$Tick extends WorldOp>(...args: $Tick): $Tick {
    const deferred = [] as unknown as $Tick
    for (let i = 0; i < args.length; i++) {
      deferred[i] = args[i]
    }
    return deferred
  }

  function maybeReleaseComponent(component: Component) {
    const pool = UNSAFE_internals.schemaPools.get(getSchemaId(component))
    if (pool && Reflect.get(component, $pool)) {
      pool.release(component)
    }
  }

  function addSystem(system: System<$Tick>) {
    systems.push(system)
    system[$systemId] = systemIds++
  }

  function removeSystem(system: System<$Tick>) {
    const index = systems.indexOf(system)
    if (index > -1) {
      systems.splice(index, 1)
    }
  }

  function addTopic(topic: Topic) {
    topics.push(topic)
  }

  function removeTopic(topic: Topic) {
    const index = topics.indexOf(topic)
    if (index > -1) {
      topics.splice(index, 1)
    }
  }

  function create(...components: Component[]) {
    const entity = entityIds++
    if (components.length > 0) {
      deferredOps.push(
        createDeferredOp(DeferredOpType.Attach, entity, components),
      )
    }
    return entity
  }

  function attach(entity: Entity, ...components: Component[]) {
    deferredOps.push(
      createDeferredOp(DeferredOpType.Attach, entity, components),
    )
  }

  function attachImmediate(entity: Entity, components: Component[]) {
    storage.attachComponents(entity, components)
  }

  function detach(
    entity: Entity,
    ...components: (Component | Schema | number)[]
  ) {
    if (components.length === 0) {
      return
    }
    const schemaIds = components.map(c =>
      typeof c === "number"
        ? c
        : UNSAFE_internals.schemaIndex.get(c as Schema) ?? getSchemaId(c),
    )
    deferredOps.push(createDeferredOp(DeferredOpType.Detach, entity, schemaIds))
  }

  function detachImmediate(entity: Entity, schemaIds: number[]) {
    const components: Component[] = []
    for (let i = 0; i < schemaIds.length; i++) {
      const schemaId = schemaIds[i]
      const component = storage.getComponentBySchemaId(entity, schemaId)
      assert(
        component !== null,
        `Failed to detach component: entity does not have component of type ${schemaId}`,
      )
      components.push(component)
    }
    storage.detachBySchemaId(entity, schemaIds)
    components.forEach(maybeReleaseComponent)
  }

  function destroy(entity: Entity) {
    if (destroyed.has(entity)) {
      return
    }
    deferredOps.push(createDeferredOp(DeferredOpType.Destroy, entity))
    destroyed.add(entity)
  }

  function destroyImmediate(entity: Entity) {
    storage.clearComponents(entity)
  }

  function has(entity: Entity, schema: Schema) {
    registerSchema(schema)
    return storage.hasComponentOfSchema(entity, schema)
  }

  function get<$Tick extends Schema>(
    entity: Entity,
    schema: $Tick,
  ): ComponentOf<$Tick> {
    registerSchema(schema)
    const component = storage.getComponentBySchema(entity, schema)

    if (component === null) {
      throw new Error("Failed to get component: entity does not have component")
    }

    return component
  }

  function tryGet<$Tick extends Schema>(
    entity: Entity,
    schema: $Tick,
  ): ComponentOf<$Tick> | null {
    try {
      registerSchema(schema)
      return storage.getComponentBySchema(entity, schema)
    } catch (error) {
      return null
    }
  }

  function reset() {
    destroyed.clear()
    // clear deferred ops
    mutableEmpty(deferredOps)
    // remove all systems
    mutableEmpty(systems)
    // remove all topics
    topics.forEach(topic => topic.clear())
    mutableEmpty(topics)
    // reset entity id counter
    entityIds = 0
    // reset step data
    world.latestTick = -1
    world.latestTickData = null as unknown as $Tick
    world.latestSystemId = -1
    // release components
    for (let i = 0; i < storage.archetypes.length; i++) {
      const archetype = storage.archetypes[i]
      for (let j = 0; j < archetype.type.length; j++) {
        const column = archetype.table[j]
        const componentPool = UNSAFE_internals.schemaPools.get(
          archetype.type[j],
        )
        for (let k = 0; k < column.length; k++) {
          const component = column[k]
          componentPool?.release(component!)
        }
      }
    }
    // reset entity-component storage
    storage.clear()
  }

  function createSnapshot(): WorldSnapshot {
    return {
      storage: storage.createSnapshot(),
    }
  }

  function applyAttachOp(op: Attach) {
    const [, entity, components] = op
    attachImmediate(entity, components)
  }

  function applyDetachOp(op: Detach) {
    const [, entity, schemaIds] = op
    detachImmediate(entity, schemaIds)
  }

  function applyDestroyOp(op: Destroy) {
    const [, entity] = op
    destroyImmediate(entity)
  }

  function applyDeferredOp(deferred: WorldOp) {
    switch (deferred[0]) {
      case DeferredOpType.Attach:
        applyAttachOp(deferred)
        break
      case DeferredOpType.Detach:
        applyDetachOp(deferred)
        break
      case DeferredOpType.Destroy:
        applyDestroyOp(deferred)
        break
    }
  }

  function step(data: $Tick) {
    let prevWorld = UNSAFE_internals.currentWorldId
    UNSAFE_internals.currentWorldId = id
    world.latestTickData = data
    for (let i = 0; i < deferredOps.length; i++) {
      applyDeferredOp(deferredOps[i])
    }
    mutableEmpty(deferredOps)
    // flush topics
    for (let i = 0; i < topics.length; i++) {
      topics[i].flush()
    }
    // execute systems
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i]
      world.latestSystemId = system[$systemId]!
      system(world)
    }
    destroyed.clear()
    world.latestTick++
    UNSAFE_internals.currentWorldId = prevWorld
  }

  const id = UNSAFE_internals.worldIds++
  const world = {
    id,
    storage,
    latestTick: -1,
    latestTickData: null as unknown as $Tick,
    latestSystemId: -1,
    attach,
    attachImmediate,
    addSystem,
    addTopic,
    create,
    destroy,
    destroyImmediate,
    get,
    createSnapshot,
    has,
    detach,
    detachImmediate,
    removeSystem,
    removeTopic,
    reset,
    step,
    tryGet,
  }

  UNSAFE_internals.worlds.push(world)

  return world
}
