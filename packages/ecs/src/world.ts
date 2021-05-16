import { createStackPool, mutableEmpty, Schema } from "@javelin/core"
import {
  Component,
  ComponentOf,
  componentTypePools,
  registerSchema,
} from "./component"
import { Entity } from "./entity"
import { UNSAFE_internals } from "./internal"
import { createSignal, Signal } from "./signal"
import { createStorage, Storage, StorageSnapshot } from "./storage"
import { Topic } from "./topic"

export enum DeferredOpType {
  Spawn,
  Attach,
  Detach,
  Mutate,
  Destroy,
}

export type Spawn = [DeferredOpType.Spawn, number, Component[]]
export type Attach = [DeferredOpType.Attach, number, Component[]]
export type Detach = [DeferredOpType.Detach, number, number[]]
export type Destroy = [DeferredOpType.Destroy, number]

export type WorldOp = Spawn | Attach | Detach | Destroy

export interface World<T = any> {
  /**
   * The unique identifier for this world.
   */
  id: number

  /**
   * Move the world forward one tick by executing all systems in order with the
   * provided tick data.
   *
   * @param data Tick data
   */
  tick(data: T): void

  /**
   * Register a system to be executed each tick.
   *
   * @param system
   */
  addSystem(system: System<T>): void

  /**
   * Remove a system.
   *
   * @param system
   */
  removeSystem(system: System<T>): void

  /**
   * Register a topic to be flushed each tick.
   *
   * @param topic
   */
  addTopic(topic: Topic): void

  /**
   * Remove a topic.
   *
   * @param topic
   */
  removeTopic(topic: Topic): void

  /**
   * Create an entity with a provided component makeup.
   *
   * @param components The new entity's components
   */
  spawn(...components: ReadonlyArray<Component>): number

  /**
   * Attach new components to an entity.
   *
   * @param entity Subject entity
   * @param components Components to insert
   */
  attach(entity: number, ...components: ReadonlyArray<Component>): void

  /**
   * Remove existing components from an entity.
   *
   * @param entity Subject entity
   * @param components Components to insert
   */
  detach(entity: number, ...components: (Schema | Component | number)[]): void

  /**
   * Destroy an entity and de-reference its components.
   *
   * @param entity Subject entity
   */
  destroy(entity: number): void

  /**
   * Retrieve a component by type for an entity. Throws an error if component is not found.
   *
   * @param entity
   * @param componentType
   */
  get<T extends Schema>(entity: number, componentType: T): ComponentOf<T>

  /**
   * Retrieve a component by type for an entity, or null if a component is not found.
   *
   * @param entity
   * @param componentType
   */
  tryGet<T extends Schema>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> | null

  /**
   * Determine if a component has a component of a specified component type.
   * Returns true if entity has component, otherwise false.
   *
   * @param entity
   * @param componentType
   */
  has(entity: number, componentType: Schema): boolean

  /**
   * Apply world ops to this world.
   *
   * @param ops WorldOps to apply
   */
  applyOps(ops: WorldOp[]): void

  /**
   * Reserve an entity identifier.
   */
  reserve(): number

  /**
   * Reset the world to its initial state, removing all entities, components,
   * systems, world ops, and internal state.
   */
  reset(): void

  /**
   * Create a serializable snapshot of the world that can be restored later.
   */
  snapshot(): WorldSnapshot

  /**
   * Entity-component storage.
   */
  readonly storage: Storage

  /**
   * Set of WorldOps that were processed last tick.
   */
  readonly ops: ReadonlyArray<WorldOp>

  /**
   * Current world state including current tick number and tick data.
   */
  readonly state: { readonly [K in keyof WorldState<T>]: WorldState<T>[K] }

  /**
   * Signal dispatched for each attached component.
   */
  readonly attached: Signal<number, ReadonlyArray<Component>>

  /**
   * Signal dispatched for each detached component.
   */
  readonly detached: Signal<number, ReadonlyArray<Component>>

  /**
   * Signal dispatched for each destroyed entity.
   */
  readonly spawned: Signal<number>

  /**
   * Signal dispatched for each destroyed entity.
   */
  readonly destroyed: Signal<number>
}

export type WorldInternal<T> = World<T> & {
  internalSpawn(entity: Entity, components: Component[]): void
  internalAttach(entity: Entity, components: Component[]): void
  internalDetach(entity: Entity, schemaIds: number[]): void
  internalDestroy(entity: Entity): void
}

export type WorldSnapshot = {
  storage: StorageSnapshot
}

export type System<T> = ((world: World<T>) => void) & {
  __JAVELIN_SYSTEM_ID__?: number
}

export type WorldOptions<T> = {
  componentPoolSize?: number
  snapshot?: WorldSnapshot
  systems?: System<T>[]
  topics?: Topic[]
}

export type WorldState<T = unknown> = {
  currentTick: number
  currentTickData: T
  currentSystem: number
}

function getInitialWorldState<T>() {
  return {
    currentTickData: (null as unknown) as T,
    currentTick: 0,
    currentSystem: 0,
  }
}

export function createWorld<T>(options: WorldOptions<T> = {}): World<T> {
  const { topics = [] } = options
  const systems: System<T>[] = []
  const deferredOps: WorldOp[] = []
  const deferredOpsPrev: WorldOp[] = []
  const deferredPool = createStackPool<WorldOp>(
    () => ([] as any) as WorldOp,
    op => {
      mutableEmpty(op)
      return op
    },
    1000,
  )
  const attached = createSignal<number, ReadonlyArray<Component>>()
  const detached = createSignal<number, ReadonlyArray<Component>>()
  const spawned = createSignal<number>()
  const destroyed = createSignal<number>()
  const destroying = new Set<number>()
  const storage = createStorage({ snapshot: options.snapshot?.storage })

  let state: WorldState<T> = getInitialWorldState()
  let prevEntity = 0
  let nextSystem = 0

  options.systems?.forEach(addSystem)

  detached.subscribe((entity, components) =>
    components.forEach(maybeReleaseComponent),
  )

  function createDeferredOp<T extends WorldOp>(...args: T): T {
    const deferred = deferredPool.retain() as T

    for (let i = 0; i < args.length; i++) {
      deferred[i] = args[i]
    }

    return deferred
  }

  function internalSpawn(entity: Entity, components: Component[]) {
    storage.create(entity, components)
    spawned.dispatch(entity)
  }

  function internalAttach(entity: Entity, components: Component[]) {
    storage.insert(entity, components)
    attached.dispatch(entity, components)
  }

  function internalDetach(entity: Entity, schemaIds: number[]) {
    const components = schemaIds
      .map(schemaId => storage.findComponentBySchemaId(entity, schemaId))
      .filter((x): x is Component => Boolean(x))
    storage.remove(entity, schemaIds)
    detached.dispatch(entity, components)
  }

  function internalDestroy(entity: Entity) {
    storage.destroy(entity)
    destroyed.dispatch(entity)
  }

  function applySpawnOp(op: Spawn) {
    const [, entity, components] = op
    internalSpawn(entity, components)
  }

  function applyAttachOp(op: Attach) {
    const [, entity, components] = op
    internalAttach(entity, components)
  }

  function applyDetachOp(op: Detach) {
    const [, entity, schemaIds] = op
    internalDetach(entity, schemaIds)
  }

  function applyDestroyOp(op: Destroy) {
    const [, entity] = op
    internalDestroy(entity)
  }

  function applyDeferredOp(deferred: WorldOp, record = true) {
    if (record === true) {
      deferredOpsPrev.push(deferred)
    }

    switch (deferred[0]) {
      case DeferredOpType.Spawn:
        return applySpawnOp(deferred)
      case DeferredOpType.Attach:
        return applyAttachOp(deferred)
      case DeferredOpType.Detach:
        return applyDetachOp(deferred)
      case DeferredOpType.Destroy:
        return applyDestroyOp(deferred)
    }
  }

  function maybeReleaseComponent(component: Component) {
    const pool = componentTypePools.get(component.__type__)

    if (pool) {
      pool.release(component)
    }
  }

  function tick(data: T) {
    let prevWorld = UNSAFE_internals.currentWorldId
    UNSAFE_internals.currentWorldId = id
    state.currentTickData = data
    // Clear world op history
    while (deferredOpsPrev.length > 0) {
      deferredPool.release(deferredOpsPrev.pop()!)
    }
    for (let i = 0; i < deferredOps.length; i++) {
      applyDeferredOp(deferredOps[i])
    }
    mutableEmpty(deferredOps)
    // flush topics
    for (let i = 0; i < topics.length; i++) {
      topics[i].flush()
    }
    // Execute systems
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i]
      world.state.currentSystem = system.__JAVELIN_SYSTEM_ID__!
      system(world)
    }
    destroying.clear()
    state.currentTick++
    UNSAFE_internals.currentWorldId = prevWorld
  }

  function addSystem(system: System<T>) {
    systems.push(system)
    system.__JAVELIN_SYSTEM_ID__ = nextSystem
  }

  function removeSystem(system: System<T>) {
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

  function spawn(...components: Component[]) {
    const entity = prevEntity++
    deferredOps.push(createDeferredOp(DeferredOpType.Spawn, entity, components))
    return entity
  }

  function attach(entity: number, ...components: Component[]) {
    deferredOps.push(
      createDeferredOp(DeferredOpType.Attach, entity, components),
    )
  }

  function detach(
    entity: number,
    ...components: (Component | Schema | number)[]
  ) {
    if (components.length === 0) {
      return
    }

    const schemaIds = components.map(c =>
      typeof c === "number"
        ? c
        : UNSAFE_internals.schemaIndex.has(c)
        ? UNSAFE_internals.schemaIndex.get(c)!
        : (c as Component).__type__,
    )

    deferredOps.push(createDeferredOp(DeferredOpType.Detach, entity, schemaIds))
  }

  function destroy(entity: number) {
    if (destroying.has(entity)) {
      return
    }
    deferredOps.push(createDeferredOp(DeferredOpType.Destroy, entity))
    destroying.add(entity)
  }

  function applyOps(ops: WorldOp[]) {
    for (let i = 0; i < ops.length; i++) {
      applyDeferredOp(ops[i], false)
    }
  }

  function has(entity: number, componentType: Schema) {
    registerSchema(componentType)
    return storage.hasComponent(entity, componentType)
  }

  function get<T extends Schema>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> {
    registerSchema(componentType)
    const component = storage.findComponent(entity, componentType)

    if (component === null) {
      throw new Error("Failed to get component: entity does not have component")
    }

    return component
  }

  function tryGet<T extends Schema>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> | null {
    registerSchema(componentType)
    return storage.findComponent(entity, componentType)
  }

  function reserve() {
    return ++prevEntity
  }

  function reset() {
    mutableEmpty(deferredOps)
    mutableEmpty(deferredOpsPrev)
    mutableEmpty(systems)

    destroying.clear()

    state = getInitialWorldState()

    prevEntity = 0

    while (deferredOps.length > 0) {
      deferredPool.release(deferredOps.pop()!)
    }

    while (deferredOpsPrev.length > 0) {
      deferredPool.release(deferredOpsPrev.pop()!)
    }

    // release components
    for (let i = 0; i < storage.archetypes.length; i++) {
      const archetype = storage.archetypes[i]

      for (let j = 0; j < archetype.signature.length; j++) {
        const column = archetype.table[j]
        const componentPool = componentTypePools.get(archetype.signature[j])

        for (let k = 0; k < column.length; k++) {
          const component = column[k]
          componentPool?.release(component!)
        }
      }
    }

    storage.clear()
  }

  function snapshot(): WorldSnapshot {
    return {
      storage: storage.snapshot(),
    }
  }

  const world = {
    addSystem,
    addTopic,
    applyOps,
    attach,
    destroy,
    detach,
    get,
    has,
    id: -1,
    ops: deferredOpsPrev,
    removeSystem,
    removeTopic,
    reserve,
    reset,
    snapshot,
    spawn,
    state,
    storage,
    tick,
    tryGet,
    // signals
    attached,
    detached,
    spawned,
    destroyed,
    // internal
    internalSpawn,
    internalAttach,
    internalDetach,
    internalDestroy,
  }

  let id = (world.id = UNSAFE_internals.worlds.push(world) - 1)

  return world
}
