import {
  Component,
  ComponentInitializerArgs,
  ComponentOf,
  ComponentState,
  ComponentType,
} from "./component"
import { createComponentPool, flagComponent, flagComponents } from "./helpers"
import { globals } from "./internal/globals"
import { createStackPool, StackPool } from "./pool"
import { createStorage, Storage } from "./storage"
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
  detach(entity: number, ...components: ReadonlyArray<Component>): void

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
  getComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T>

  /**
   * Retrieve a component by type for an entity, or null if a component is not found.
   *
   * @param entity
   * @param componentType
   */
  tryGetComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> | null

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
  getObservedComponent<C extends Component>(component: C): C

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
   * Reset the world to its initial state, removing all entities, components,
   * systems, world ops, and internal state.
   */
  reset(): void

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
}

export type System<T> = (world: World<T>) => void

export type WorldOptions<T> = {
  systems?: System<T>[]
  componentPoolSize?: number
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
  const { systems = [], componentPoolSize = 1000 } = options
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
  const componentPoolsByComponentTypeId = new Map<
    number,
    StackPool<Component>
  >()
  const storage = createStorage()
  const componentTypes: ComponentType[] = []
  const destroyed = new Set<number>()
  const detached = new Map<number, readonly number[]>()
  const attaching: (readonly Component[])[] = []

  let state: WorldState<T> = getInitialWorldState()
  let entityCounter = 0

  function applySpawnOp(op: SpawnOp) {
    const [, entity, components] = op

    flagComponents(components, ComponentState.Attaching)
    attaching.push(components)

    storage.create(entity, components as Component[])
  }

  function applyAttachOp(op: AttachOp) {
    const [, entity, components] = op

    flagComponents(components, ComponentState.Attaching)
    attaching.push(components)

    storage.insert(entity, components as Component[])
  }

  function applyDetachOp(op: DetachOp) {
    const [, entity, componentTypeIds] = op

    for (let i = 0; i < componentTypeIds.length; i++) {
      const component = storage.findComponentByComponentTypeId(
        entity,
        componentTypeIds[i],
      )!

      flagComponent(component, ComponentState.Detached)
    }

    detached.set(entity, componentTypeIds)
  }

  function applyDestroyOp(op: DestroyOp) {
    const [, entity] = op
    const components = storage.getEntityComponents(entity)

    flagComponents(components, ComponentState.Detached)

    destroyed.add(entity)
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
    const pool = componentPoolsByComponentTypeId.get(component._tid)

    if (pool) {
      pool.release(component)
    }
  }

  function finalDestroy(entity: number) {
    storage.getEntityComponents(entity).forEach(maybeReleaseComponent)
    storage.destroy(entity)
  }

  function finalDetach(componentTypeIds: readonly number[], entity: number) {
    for (let i = 0; i < componentTypeIds.length; i++) {
      const component = storage.findComponentByComponentTypeId(
        entity,
        componentTypeIds[i],
      )!
      maybeReleaseComponent(component)
    }
    storage.removeByTypeIds(entity, componentTypeIds as number[])
  }

  function maintain() {
    // Clear change cache
    storage.clearMutations()

    // Clear world op history
    while (worldOpsPrevious.length > 0) {
      worldOpPool.release(worldOpsPrevious.pop()!)
    }

    while (attaching.length > 0) {
      flagComponents(attaching.pop()!, ComponentState.Attached)
    }

    detached.forEach(finalDetach)
    detached.clear()

    destroyed.forEach(finalDestroy)
    destroyed.clear()

    while (worldOps.length > 0) {
      applyWorldOp(worldOps.pop()!)
    }
  }

  function tick(data: T) {
    globals.__CURRENT_WORLD__ = id
    state.currentTickData = data

    if (state.currentTick === 0) {
      maintain()
    }

    maintain()

    // Execute systems
    for (let i = 0; i < systems.length; i++) {
      world.state.currentSystem = i
      systems[i](world)
    }

    state.currentTick++
  }

  function addSystem(system: System<T>) {
    systems.push(system)
  }

  function removeSystem(system: System<T>) {
    const index = systems.indexOf(system)

    if (index > -1) {
      systems.splice(index, 1)
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

    const pool = componentPoolsByComponentTypeId.get(
      componentType.type,
    ) as StackPool<ComponentOf<T>>

    const component = pool.retain()

    if (componentType.initialize) {
      componentType.initialize(component, ...args)
    }

    return component
  }

  function createOp<T extends WorldOp>(...args: T): T {
    const worldOp = worldOpPool.retain() as T

    for (let i = 0; i < args.length; i++) {
      worldOp[i] = args[i]
    }

    return worldOp
  }

  function spawn(...components: ReadonlyArray<Component>) {
    const entity = entityCounter++
    const worldOp = createOp(WorldOpType.Spawn, entity, components)

    worldOps.push(worldOp)

    return entity
  }

  function attach(entity: number, ...components: ReadonlyArray<Component>) {
    const op = createOp(WorldOpType.Attach, entity, components)

    worldOps.push(op)
  }

  function detach(entity: number, ...components: ReadonlyArray<Component>) {
    const componentTypeIds = components.map(c => c._tid)
    const worldOp = createOp(WorldOpType.Detach, entity, componentTypeIds)

    flagComponents(components, ComponentState.Detaching)

    worldOps.push(worldOp)
  }

  function destroy(entity: number) {
    const worldOp = createOp(WorldOpType.Destroy, entity)
    const components = storage.getEntityComponents(entity)

    flagComponents(components, ComponentState.Detaching)

    worldOps.push(worldOp)
  }

  function applyOps(opsToApply: WorldOp[]) {
    for (let i = 0; i < opsToApply.length; i++) {
      const op = opsToApply[i]

      switch (op[0]) {
        case WorldOpType.Detach: {
          const [, entity, componentTypeIds] = op
          const components = componentTypeIds.map(
            componentTypeId =>
              storage.findComponentByComponentTypeId(entity, componentTypeId)!,
          )

          for (let j = 0; j < components.length; j++) {
            const component = components[j]

            if (component) {
              flagComponent(component, ComponentState.Detaching)
            }
          }
          break
        }
        case WorldOpType.Destroy: {
          const [, entity] = op
          const components = storage.getEntityComponents(entity)

          flagComponents(components, ComponentState.Detaching)
          break
        }
      }

      applyWorldOp(op, false)
    }
  }

  function getComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> {
    const component = storage.findComponent(entity, componentType)

    if (component === null) {
      throw new Error("Component not found")
    }

    return component
  }

  function tryGetComponent<T extends ComponentType>(
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
        `Tried to register componentType with type id ${componentType.type} more than once.`,
      )
    }

    componentTypes.push(componentType)
    componentPoolsByComponentTypeId.set(
      componentType.type,
      createComponentPool(componentType, poolSize),
    )
  }

  function reset() {
    mutableEmpty(worldOps)
    mutableEmpty(worldOpsPrevious)
    mutableEmpty(componentTypes)
    mutableEmpty(systems)
    mutableEmpty(attaching)

    componentPoolsByComponentTypeId.clear()
    destroyed.clear()
    detached.clear()

    state = getInitialWorldState()

    entityCounter = 0

    while (worldOps.length > 0) {
      worldOpPool.release(worldOps.pop()!)
    }

    while (worldOpsPrevious.length > 0) {
      worldOpPool.release(worldOpsPrevious.pop()!)
    }

    // Prior to clearing storage, release each component back to its pool.
    for (let i = 0; i < storage.archetypes.length; i++) {
      const archetype = storage.archetypes[i]

      for (let j = 0; j < archetype.layout.length; j++) {
        const column = archetype.table[j]
        const componentPool = componentPoolsByComponentTypeId.get(
          archetype.layout[j],
        )

        for (let k = 0; k < column.length; k++) {
          const component = column[k]
          componentPool?.release(component!)
        }
      }
    }

    storage.clear()
  }

  const { getObservedComponent, isComponentChanged, patch } = storage

  const world = {
    addSystem,
    applyOps,
    attach,
    component,
    componentTypes,
    destroy,
    detach,
    getComponent,
    getObservedComponent,
    id: -1,
    isComponentChanged,
    ops: worldOpsPrevious,
    patch,
    removeSystem,
    reset,
    spawn,
    state,
    storage,
    tick,
    tryGetComponent,
  }

  let id = (world.id = globals.__WORLDS__.push(world) - 1)

  return world
}
