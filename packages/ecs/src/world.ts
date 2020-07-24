import {
  Component,
  ComponentOf,
  ComponentSpec,
  ComponentType,
} from "./component"
import { ComponentFactoryLike } from "./helpers"
import { createStackPool } from "./pool"
import { createStorage, Storage } from "./storage"
import { $worldStorageKey } from "./symbols"
import { Mutable } from "./types"
import { mutableEmpty } from "./util"
import {
  CreateOp,
  DestroyOp,
  InsertOp,
  RemoveOp,
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
   * Create an entity with a provided component makeup.
   *
   * @param components The new entity's components
   * @param tags The new entity's tags
   */
  create(components: ReadonlyArray<ComponentSpec>, tags?: number): number

  /**
   * Add new components to an entity.
   *
   * @param entity Subject entity
   * @param components Components to insert
   */
  insert(entity: number, components: ReadonlyArray<Component>): void

  /**
   * Remove existing components from an entity.
   *
   * @param entity Subject entity
   * @param components Components to insert
   */
  remove(entity: number, components: ReadonlyArray<Component>): void

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
   * Determine if an entity is committed; that is, it was neither added nor
   * removed during the previous tick.
   *
   * @param entity Subject entity
   */
  isCommitted(entity: number): boolean

  /**
   * Add a bit flag to an entity's bitmask.
   *
   * @param entity Subject entity
   * @param tags Tags to add
   */
  addTag(entity: number, tags: number): void

  /**
   * Remove a bit flag from an entity's bitmask.
   *
   * @param entity Subject entity
   * @param tags Tags to add
   */
  removeTag(entity: number, tags: number): void

  /**
   * Determine if an entity's bitmask has a given bit flag.
   *
   * @param entity Subject entity
   * @param tags Tags to check for
   */
  hasTag(entity: number, tags: number): boolean

  /**
   * Get a mutable reference to a component.
   *
   * @param component Subject component
   */
  mut<C extends Component>(component: C): Mutable<C>

  /**
   * Register a component factory with the world, automatically pooling its
   * components.
   *
   * @param factory Component factory
   */
  registerComponentFactory(factory: ComponentFactoryLike): void

  /**
   * Apply world ops to this world.
   *
   * @param ops WorldOps to apply
   */
  applyOps(ops: WorldOp[]): void

  /**
   * Set of WorldOps that were processed last tick.
   */
  readonly ops: ReadonlyArray<WorldOp>

  /**
   * Set of entities that were created last tick.
   */
  readonly created: ReadonlySet<number>

  /**
   * Set of entities that were destroyed last tick.
   */
  readonly destroyed: ReadonlySet<number>

  /**
   * Entity-component storage.
   */
  readonly [$worldStorageKey]: Storage

  /**
   * Array of registered component factories.
   */
  readonly registeredComponentFactories: ReadonlyArray<ComponentFactoryLike>
}

export type System<T> = (world: World<T>, data: T) => void

type WorldOptions<T> = {
  systems?: System<T>[]
  componentFactories?: ComponentFactoryLike[]
  componentPoolSize?: number
}

export const createWorld = <T>(options: WorldOptions<T> = {}): World<T> => {
  const {
    systems = [],
    componentFactories = [],
    componentPoolSize = 1000,
  } = options
  const ops: WorldOp[] = []
  const previousOps: WorldOp[] = []
  const opPool = createStackPool<WorldOp>(
    () => ([] as any) as WorldOp,
    op => {
      mutableEmpty(op)
      return op
    },
    componentPoolSize,
  )
  const storage = createStorage()
  const created = new Set<number>()
  const destroyed = new Set<number>()
  const registeredComponentFactories: ComponentFactoryLike[] = []

  let nextEntity = 0

  function applyCreateOp(op: CreateOp) {
    const [, entity, components, tags] = op

    for (let i = 0; i < components.length; i++) {
      components[i]._e = entity
    }

    storage.create(entity, components as Component[], tags)
    created.add(entity)
  }

  function applyInsertOp(op: InsertOp) {
    const [, entity, components] = op

    for (let i = 0; i < components.length; i++) {
      const component = components[i]

      component._e = entity
    }

    storage.insert(entity, components as Component[])
  }

  function applyRemoveOp(op: RemoveOp) {
    const [, entity, components] = op

    for (let i = 0; i < components.length; i++) {
      const component = components[i]

      delete component._e
    }

    storage.remove(entity, components as Component[])
  }

  function applyDestroyOp(op: DestroyOp) {
    const [, entity] = op

    destroyed.add(entity)
  }

  function tick(data: T) {
    // Clear world op history
    previousOps.forEach(opPool.release)
    mutableEmpty(previousOps)

    // Clear record of created and destroyed entities
    if (created.size > 0) {
      created.clear()
    }

    if (destroyed.size > 0) {
      destroyed.forEach(storage.destroy)
      destroyed.clear()
    }

    let op: WorldOp | undefined

    let i = 0

    // Process world operations
    while ((op = ops[i++])) {
      switch (op[0]) {
        case WorldOpType.Create: {
          applyCreateOp(op)
          break
        }
        case WorldOpType.Insert: {
          applyInsertOp(op)
          break
        }
        case WorldOpType.Remove: {
          applyRemoveOp(op)
          break
        }
        case WorldOpType.Destroy: {
          applyDestroyOp(op)
          break
        }
        default:
          break
      }

      previousOps.push(op)
    }

    mutableEmpty(ops)

    // Execute systems
    for (let i = 0; i < systems.length; i++) {
      systems[i](world, data)
    }
  }

  function addSystem(system: System<T>) {
    systems.push(system)
  }

  function create(components: ReadonlyArray<Component>, tags?: number) {
    const entity = nextEntity++
    const op = opPool.retain() as CreateOp

    op[0] = WorldOpType.Create
    op[1] = entity
    op[2] = components
    op[3] = tags

    ops.push(op)
    created.add(entity)

    return entity
  }

  function insert(entity: number, components: ReadonlyArray<Component>) {
    const op = opPool.retain() as InsertOp

    op[0] = WorldOpType.Insert
    op[1] = entity
    op[2] = components

    ops.push(op)
  }

  function remove(entity: number, components: ReadonlyArray<Component>) {
    const op = opPool.retain() as RemoveOp

    op[0] = WorldOpType.Remove
    op[1] = entity
    op[2] = components

    ops.push(op)
  }

  function destroy(entity: number) {
    const op = opPool.retain() as DestroyOp

    op[0] = WorldOpType.Destroy
    op[1] = entity

    ops.push(op)
  }

  function applyOps(opsToApply: WorldOp[]) {
    for (let i = 0; i < opsToApply.length; i++) {
      ops.push(opsToApply[i])
    }
  }

  function getComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> {
    return storage.findComponent(entity, componentType)
  }

  function tryGetComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> | null {
    try {
      return getComponent(entity, componentType)
    } catch {
      return null
    }
  }

  function isCommitted(entity: number) {
    return !(created.has(entity) || destroyed.has(entity))
  }

  function mut<C extends Component>(component: C) {
    storage.incrementVersion(component)
    return component as Mutable<C>
  }

  function registerComponentFactory(factory: ComponentFactoryLike) {
    storage.registerComponentFactory(factory)
    registeredComponentFactories.push(factory)
  }

  componentFactories.forEach(registerComponentFactory)

  const { addTag, removeTag, hasTag } = storage

  const world: World<T> = {
    addSystem,
    addTag,
    applyOps,
    create,
    created,
    destroy,
    destroyed,
    getComponent,
    hasTag,
    insert,
    isCommitted,
    mut,
    ops,
    registerComponentFactory,
    registeredComponentFactories,
    remove,
    removeTag,
    tick,
    tryGetComponent,
    [$worldStorageKey]: storage,
  }

  return world
}
