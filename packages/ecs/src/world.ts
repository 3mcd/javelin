import { schemaEqualsSerializedSchema } from "@javelin/model"
import {
  Component,
  ComponentInitializerArgs,
  ComponentOf,
  ComponentType,
} from "./component"
import { Entity } from "./entity"
import {
  createComponentPool,
  serializeComponentType,
  SerializedComponentType,
} from "./helpers"
import { globals } from "./internal/globals"
import { createStackPool, StackPool } from "./pool"
import { createSignal, Signal } from "./signal"
import { createStorage, Storage, StorageSnapshot } from "./storage"
import { Topic } from "./topic"
import { mutableEmpty } from "./util"
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
   * Create a component.
   *
   * @param componentType component type
   * @param args component type initializer arguments
   */
  component<T extends ComponentType>(
    componentType: T,
    ...args: ComponentInitializerArgs<T>
  ): ComponentOf<T>

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
   * Determine if a component was changed last tick.
   *
   * @param component Component
   */
  isComponentChanged(component: Component): boolean

  /**
   * Get a mutable reference to a component.
   *
   * @param component Subject component
   */
  getObserved<C extends Component>(component: C): C

  /**
   * Apply world ops to this world.
   *
   * @param ops WorldOps to apply
   */
  applyOps(ops: WorldOp[]): void

  /**
   * Apply a component patch to the component of an entity.
   *
   * @param entity Entity
   * @param componentType Component type
   * @param path Path to property
   * @param value New value
   */
  patch(
    entity: number,
    componentType: number,
    path: string,
    value: unknown,
  ): void

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
   * Array of registered component factories.
   */
  readonly componentTypes: ReadonlyArray<ComponentType>

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
  componentTypes: SerializedComponentType[]
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
  const { componentPoolSize = 1000, topics = [] } = options
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
  const componentTypes: ComponentType[] = []
  const componentTypePools = new Map<number, StackPool<Component>>()
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
    const pool = componentTypePools.get(component._tid)

    if (pool) {
      pool.release(component)
    }
  }

  function tick(data: T) {
    globals.__CURRENT_WORLD__ = id
    state.currentTickData = data

    // Clear change cache
    storage.clearMutations()

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

  function component<T extends ComponentType>(
    componentType: T,
    ...args: ComponentInitializerArgs<T>
  ): ComponentOf<T> {
    const componentTypeHasBeenRegistered = componentTypes.includes(
      componentType,
    )

    if (!componentTypeHasBeenRegistered) {
      registerComponentType(componentType)
    }

    const pool = componentTypePools.get(componentType.type) as StackPool<
      ComponentOf<T>
    >

    const component = pool.retain()

    if (componentType.initialize) {
      componentType.initialize(component, ...args)
    }

    return component
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

    if ("type" in components[0]) {
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
    return storage.hasComponent(entity, componentType)
  }

  function get<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> {
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
    return storage.findComponent(entity, componentType)
  }

  function registerComponentType(
    componentType: ComponentType,
    poolSize = componentPoolSize,
  ) {
    const registeredComponentTypeWithTypeId = componentTypes.find(
      ({ type }) => componentType.type === type,
    )

    if (registeredComponentTypeWithTypeId) {
      throw new Error(
        `Failed to register component type: a componentType with same id is already registered`,
      )
    }

    if (options.snapshot) {
      const snapshotComponentTypeWithTypeId = options.snapshot.componentTypes.find(
        s => s.type === componentType.type,
      )

      if (
        snapshotComponentTypeWithTypeId &&
        !schemaEqualsSerializedSchema(
          componentType.schema,
          snapshotComponentTypeWithTypeId.schema,
        )
      ) {
        throw new Error(
          `Failed to register component type: component type schema does not match world snapshot`,
        )
      }
    }

    componentTypes.push(componentType)
    componentTypePools.set(
      componentType.type,
      createComponentPool(componentType, poolSize),
    )
  }

  function reserve() {
    return ++prevEntity
  }

  function reset() {
    mutableEmpty(worldOps)
    mutableEmpty(worldOpsPrevious)
    mutableEmpty(componentTypes)
    mutableEmpty(systems)

    componentTypePools.clear()
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
      componentTypes: componentTypes.map(serializeComponentType),
      storage: storage.snapshot(),
    }
  }

  const { getObservedComponent, isComponentChanged, patch } = storage

  const world = {
    addSystem,
    addTopic,
    applyOps,
    attach,
    component,
    componentTypes,
    destroy,
    detach,
    get,
    getObserved: getObservedComponent,
    has,
    id: -1,
    isComponentChanged,
    ops: worldOpsPrevious,
    patch,
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

  let id = (world.id = globals.__WORLDS__.push(world) - 1)

  return world
}
