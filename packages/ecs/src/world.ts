import { createStackPool, mutableEmpty } from "@javelin/model"
import {
  Component,
  ComponentOf,
  ComponentType,
  componentTypePools,
  registerComponentType,
} from "./component"
import { Entity } from "./entity"
import { UNSAFE_internals } from "./internal"
import { $componentType } from "./internal/symbols"
import { createSignal, Signal } from "./signal"
import { createStorage, Storage, StorageSnapshot } from "./storage"
import { Topic } from "./topic"
import {
  AttachOp,
  DestroyOp,
  DetachOp,
  SpawnOp,
  WorldOp,
  WorldOpType,
} from "./world_op"

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
  detach(
    entity: number,
    ...components: ReadonlyArray<Component> | ComponentType[]
  ): void

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
  get<T extends ComponentType>(entity: number, componentType: T): ComponentOf<T>

  /**
   * Retrieve a component by type for an entity, or null if a component is not found.
   *
   * @param entity
   * @param componentType
   */
  tryGet<T extends ComponentType>(
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
  has(entity: number, componentType: ComponentType): boolean

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
  internalSpawn(entity: Entity): void
  internalAttach(entity: Entity, components: Component[]): void
  internalDetach(entity: Entity, components: Component[]): void
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
  const worldOps: WorldOp[] = []
  const worldOpsPrevious: WorldOp[] = []
  const worldOpPool = createStackPool<WorldOp>(
    () => ([] as any) as WorldOp,
    op => {
      mutableEmpty(op)
      return op
    },
    1000,
  )
  const seenComponentTypes = new Set<ComponentType>()
  const attached = createSignal<number, ReadonlyArray<Component>>()
  const detached = createSignal<number, ReadonlyArray<Component>>()
  const spawned = createSignal<number>()
  const destroyed = createSignal<number>()
  const destroying = new Set<number>()
  const storage = createStorage({ snapshot: options.snapshot?.storage })

  let state: WorldState<T> = getInitialWorldState()
  let prevEntity = 0
  let nextSystem = 0
  let nextComponentTypeId = 0

  options.systems?.forEach(addSystem)

  detached.subscribe((entity, components) =>
    components.forEach(maybeReleaseComponent),
  )

  function createWorldOp<T extends WorldOp>(...args: T): T {
    const worldOp = worldOpPool.retain() as T

    for (let i = 0; i < args.length; i++) {
      worldOp[i] = args[i]
    }

    return worldOp
  }

  function internalSpawn(entity: Entity) {
    storage.create(entity, [])
    spawned.dispatch(entity)
  }

  function internalAttach(entity: Entity, components: Component[]) {
    storage.insert(entity, components)
    attached.dispatch(entity, components)
  }

  function internalDetach(entity: Entity, components: Component[]) {
    storage.remove(entity, components)
    detached.dispatch(entity, components)
  }

  function internalDestroy(entity: Entity) {
    storage.destroy(entity)
    destroyed.dispatch(entity)
  }

  function applySpawnOp(op: SpawnOp) {
    const [, entity] = op
    internalSpawn(entity)
  }

  function applyAttachOp(op: AttachOp) {
    const [, entity, components] = op
    internalAttach(entity, components as Component[])
  }

  function applyDetachOp(op: DetachOp) {
    const [, entity, components] = op
    internalDetach(entity, components as Component[])
  }

  function applyDestroyOp(op: DestroyOp) {
    const [, entity] = op
    internalDestroy(entity)
  }

  function applyWorldOp(worldOp: WorldOp, record = true) {
    if (record === true) {
      worldOpsPrevious.push(worldOp)
    }

    switch (worldOp[0]) {
      case WorldOpType.Spawn:
        return applySpawnOp(worldOp)
      case WorldOpType.Attach:
        return applyAttachOp(worldOp)
      case WorldOpType.Detach:
        return applyDetachOp(worldOp)
      case WorldOpType.Destroy:
        return applyDestroyOp(worldOp)
    }
  }

  function maybeReleaseComponent(component: Component) {
    const pool = componentTypePools.get(component.__type__)

    if (pool) {
      pool.release(component)
    }
  }

  function tick(data: T) {
    let prevWorld = UNSAFE_internals.__CURRENT_WORLD__
    UNSAFE_internals.__CURRENT_WORLD__ = id

    state.currentTickData = data

    // Clear world op history
    while (worldOpsPrevious.length > 0) {
      worldOpPool.release(worldOpsPrevious.pop()!)
    }

    for (let i = 0; i < worldOps.length; i++) {
      applyWorldOp(worldOps[i])
    }

    mutableEmpty(worldOps)

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

    UNSAFE_internals.__CURRENT_WORLD__ = prevWorld
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

  function spawn(...components: ReadonlyArray<Component>) {
    const entity = prevEntity++

    worldOps.push(
      createWorldOp(WorldOpType.Spawn, entity),
      createWorldOp(WorldOpType.Attach, entity, components),
    )

    return entity
  }

  function attach(entity: number, ...components: ReadonlyArray<Component>) {
    worldOps.push(createWorldOp(WorldOpType.Attach, entity, components))
  }

  function detach(
    entity: number,
    ...components: ReadonlyArray<Component> | ComponentType[]
  ) {
    if (components.length === 0) {
      return
    }

    if ($componentType in components[0]) {
      components = (components as ComponentType[]).map(ct => get(entity, ct))
    }

    worldOps.push(
      createWorldOp(WorldOpType.Detach, entity, components as Component[]),
    )
  }

  function destroy(entity: number) {
    if (destroying.has(entity)) {
      return
    }
    const components = storage.getEntityComponents(entity)
    worldOps.push(
      createWorldOp(WorldOpType.Detach, entity, components),
      createWorldOp(WorldOpType.Destroy, entity),
    )
    destroying.add(entity)
  }

  function applyOps(ops: WorldOp[]) {
    for (let i = 0; i < ops.length; i++) {
      applyWorldOp(ops[i], false)
    }
  }

  function has(entity: number, componentType: ComponentType) {
    registerComponentType(componentType)
    return storage.hasComponent(entity, componentType)
  }

  function get<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> {
    registerComponentType(componentType)
    const component = storage.findComponent(entity, componentType)

    if (component === null) {
      throw new Error("Component not found")
    }

    return component
  }

  function tryGet<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> | null {
    registerComponentType(componentType)
    return storage.findComponent(entity, componentType)
  }

  function reserve() {
    return ++prevEntity
  }

  function reset() {
    mutableEmpty(worldOps)
    mutableEmpty(worldOpsPrevious)
    mutableEmpty(systems)

    destroying.clear()

    state = getInitialWorldState()

    prevEntity = 0

    while (worldOps.length > 0) {
      worldOpPool.release(worldOps.pop()!)
    }

    while (worldOpsPrevious.length > 0) {
      worldOpPool.release(worldOpsPrevious.pop()!)
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
    ops: worldOpsPrevious,
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

  let id = (world.id = UNSAFE_internals.__WORLDS__.push(world) - 1)

  return world
}
