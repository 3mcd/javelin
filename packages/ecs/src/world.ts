import { Component, ComponentWithoutEntity } from "./component"
import { ComponentFactoryLike } from "./helpers"
import { createStackPool } from "./pool/stack_pool"
import { QueryLike, Selector, SelectorResult } from "./query"
import { createStorage, Storage } from "./storage"
import { Mutable } from "./types"

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
  create(
    components: ReadonlyArray<ComponentWithoutEntity>,
    tags?: number,
  ): number

  /**
   * Add new components to a target entity.
   *
   * @param entity Subject entity
   * @param components Components to insert
   */
  insert(entity: number, ...components: ReadonlyArray<Component>): void

  /**
   * Destroy an entity and de-reference its components.
   *
   * @param entity Subject entity
   */
  destroy(entity: number): void

  /**
   * Execute a query against this world.
   *
   * @param query Query to execute
   */
  query<S extends Selector>(
    query: QueryLike<S>,
  ): IterableIterator<SelectorResult<S>>

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
   * @param factory Component factory
   */
  registerComponentFactory(factory: ComponentFactoryLike): void

  /**
   * Set of entities that were created during the previous tick.
   */
  readonly created: ReadonlySet<number>

  /**
   * Set of entities that were destroyed during the previous tick.
   */
  readonly destroyed: ReadonlySet<number>

  /**
   * Entity <-> Component storage.
   */
  readonly storage: Storage

  /**
   * Array of registered component factories.
   */
  readonly registeredComponentFactories: ReadonlyArray<ComponentFactoryLike>
}

export type System<T> = (data: T, world: World<T>) => void

enum WorldOpType {
  Create,
  Insert,
  Destroy,
}

type CreateOp = [WorldOpType.Create, number, ReadonlyArray<Component>, number?]
type InsertOp = [WorldOpType.Insert, number, ReadonlyArray<Component>]
type DestroyOp = [WorldOpType.Destroy, number]

type WorldOp = CreateOp | InsertOp | DestroyOp

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
  const opPool = createStackPool<WorldOp>(
    () => ([] as any) as WorldOp,
    op => op,
    componentPoolSize,
  )
  const storage = createStorage()
  const created = new Set<number>()
  const destroyed = new Set<number>()
  const registeredComponentFactories: ComponentFactoryLike[] = []

  let nextEntity = 0

  function tick(data: T) {
    // Clean up entities
    destroyed.forEach(storage.destroy)
    destroyed.clear()
    created.clear()

    let i = 0
    let op: WorldOp | undefined

    // Process all world operations
    while ((op = ops[i++])) {
      switch (op[0]) {
        case WorldOpType.Create: {
          for (let i = 0; i < op[2].length; i++) {
            op[2][i]._e = op[1]
          }
          storage.create(op[1], op[2] as Component[], op[3])
          created.add(op[1])
          break
        }
        case WorldOpType.Insert: {
          for (let i = 0; i < op[2].length; i++) {
            op[2][i]._e = op[1]
          }
          storage.insert(op[1], ...(op[2] as Component[]))
          break
        }
        case WorldOpType.Destroy:
          destroyed.add(op[1])
          break
        default:
          break
      }

      opPool.release(op)
    }

    ops.length = 0

    // Execute all systems
    for (let i = 0; i < systems.length; i++) {
      systems[i](data, world)
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

  function insert(entity: number, ...components: ReadonlyArray<Component>) {
    const op = opPool.retain() as InsertOp

    op[0] = WorldOpType.Insert
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

  function isCommitted(entity: number) {
    return !(created.has(entity) || destroyed.has(entity))
  }

  function query<S extends Selector>(q: QueryLike<S>) {
    return q.run(world)
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
    create,
    insert,
    destroy,
    tick,
    addSystem,
    created,
    destroyed,
    storage,
    query,
    isCommitted,
    addTag,
    removeTag,
    hasTag,
    mut,
    registerComponentFactory,
    registeredComponentFactories,
  }

  return world
}
