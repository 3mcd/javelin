import {
  Component,
  ComponentInitializerArgs,
  ComponentOf,
  ComponentState,
  ComponentType,
} from "./component"
import { createComponentPool } from "./helpers"
import { createStackPool, StackPool } from "./pool"
import { initializeComponentFromSchema } from "./schema"
import { createStorage, Storage } from "./storage"
import { $worldStorageKey } from "./symbols"
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
   * Entity-component storage.
   */
  readonly [$worldStorageKey]: Storage

  /**
   * Set of WorldOps that were processed last tick.
   */
  readonly ops: ReadonlyArray<WorldOp>

  /**
   * Array of registered component factories.
   */
  readonly componentTypes: ReadonlyArray<ComponentType>

  /**
   * Set of components attached last tick.
   */
  readonly attached: ReadonlySet<Component>
}

export type System<T> = (world: World<T>, data: T) => void

type WorldOptions<T> = {
  systems?: System<T>[]
  componentPoolSize?: number
}

export const createWorld = <T>(options: WorldOptions<T> = {}): World<T> => {
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
  const attached = new Set<Component>()

  let entityCounter = 0

  function flagDetached(component: Component) {
    component.state = ComponentState.Detached
  }

  function applySpawnOp(op: SpawnOp) {
    const [, entity, components] = op

    for (let i = 0; i < components.length; i++) {
      attached.add(components[i])
      ;(components[i] as any).__entity = entity
    }

    storage.create(entity, components as Component[])
  }

  function applyAttachOp(op: AttachOp) {
    const [, entity, components] = op

    for (let i = 0; i < components.length; i++) {
      attached.add(components[i])
    }

    storage.insert(entity, components as Component[])
  }

  function applyDetachOp(op: DetachOp) {
    const [, entity, componentTypeIds] = op
    const components = storage.getEntityComponents(entity)

    for (let i = 0; i < components.length; i++) {
      const component = components[i]

      if (componentTypeIds.includes(component.type)) {
        maybeReleaseComponent(component)
      }
    }

    storage.removeByTypeIds(entity, componentTypeIds as number[])
  }

  function applyDestroyOp(op: DestroyOp) {
    const [, entity] = op

    destroyed.add(entity)
  }

  function applyWorldOp(worldOp: WorldOp) {
    worldOpsPrevious.push(worldOp)

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
    const pool = componentPoolsByComponentTypeId.get(component.type)

    if (pool) {
      pool.release(component)
    }
  }

  function internalDestroy(entity: number) {
    storage.getEntityComponents(entity).forEach(maybeReleaseComponent)
    storage.destroy(entity)
  }

  function tick(data: T) {
    // Clear change cache
    storage.clearMutations()

    // Clear world op history
    while (worldOpsPrevious.length > 0) {
      worldOpPool.release(worldOpsPrevious.pop()!)
    }

    destroyed.forEach(internalDestroy)
    destroyed.clear()

    attached.clear()

    while (worldOps.length > 0) {
      applyWorldOp(worldOps.pop()!)
    }

    // Execute systems
    for (let i = 0; i < systems.length; i++) {
      systems[i](world, data)
    }
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

    const component = pool
      ? pool.retain()
      : (initializeComponentFromSchema(
          { type: componentType.type },
          componentType.schema,
        ) as ComponentOf<T>)

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
    const componentTypeIds = components.map(c => c.type)
    const worldOp = createOp(WorldOpType.Detach, entity, componentTypeIds)

    worldOps.push(worldOp)

    components.forEach(flagDetached)
  }

  function destroy(entity: number) {
    const worldOp = createOp(WorldOpType.Destroy, entity)
    const components = storage.getEntityComponents(entity)

    worldOps.push(worldOp)

    components.forEach(flagDetached)
  }

  function applyOps(opsToApply: WorldOp[]) {
    for (let i = 0; i < opsToApply.length; i++) {
      const op = opsToApply[i]

      if (op[0] === WorldOpType.Detach) {
        const [, entity, componentTypeIds] = op
        const components = storage.getEntityComponents(entity)

        for (let j = 0; j < components.length; j++) {
          const component = components[j]

          if (componentTypeIds.includes(component.type)) {
            flagDetached(component)
          }
        }
      } else if (op[0] === WorldOpType.Destroy) {
        const [, entity] = op
        const components = storage.getEntityComponents(entity)

        components.forEach(flagDetached)
      }

      applyWorldOp(op)
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

  const { getObservedComponent, isComponentChanged, patch } = storage

  const world = {
    [$worldStorageKey]: storage,
    addSystem,
    applyOps,
    attach,
    attached,
    component,
    componentTypes,
    destroy,
    detach,
    getComponent,
    getObservedComponent,
    isComponentChanged,
    ops: worldOpsPrevious,
    patch,
    removeSystem,
    spawn,
    tick,
    tryGetComponent,
  }

  return world
}
