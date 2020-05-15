import { Component, ComponentType, ComponentsOf } from "./component"
import { createStorage, Storage } from "./storage"
import { createStackPool } from "./pool/stack_pool"
import { QueryLike } from "./query"
import { Mutable } from "./types"
import { ComponentFactoryLike } from "./helpers"

type QueryMethod = <T extends ComponentType[]>(
  query: QueryLike<T>,
) => IterableIterator<ComponentsOf<T>>

export type World<T = any> = {
  tick(data: T): void
  create(components: ReadonlyArray<Component>, tags?: number): number
  insert(entity: number, ...components: ReadonlyArray<Component>): void
  destroy(entity: number): void
  created: ReadonlySet<number>
  destroyed: ReadonlySet<number>
  storage: Storage
  query: QueryMethod
  isEphemeral(entity: number): boolean
  addTag(entity: number, tags: number): void
  removeTag(entity: number, tags: number): void
  hasTag(entity: number, tags: number): boolean
  mut<C extends Component>(component: C): Mutable<C>
  registerComponentFactory(factory: ComponentFactoryLike): void
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

export const createWorld = <T>(systems: System<T>[]): World<T> => {
  const ops: WorldOp[] = []
  const opPool = createStackPool<WorldOp>(
    () => ([] as any) as WorldOp,
    op => op,
    1000,
  )
  const storage = createStorage()
  const created = new Set<number>()
  const destroyed = new Set<number>()
  const ephemeral = new Set<number>()

  let nextEntity = 0

  function tick(data: T) {
    // Clean up entities
    destroyed.forEach(storage.destroy)
    destroyed.clear()
    created.clear()
    ephemeral.clear()

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

  function create(components: ReadonlyArray<Component>, tags?: number) {
    const entity = nextEntity++
    const op = opPool.retain() as CreateOp

    op[0] = WorldOpType.Create
    op[1] = entity
    op[2] = components
    op[3] = tags

    ops.push(op)
    created.add(entity)
    ephemeral.add(entity)

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
    ephemeral.add(entity)
  }

  function isEphemeral(entity: number) {
    return ephemeral.has(entity)
  }

  function query<T extends ComponentType[]>(q: QueryLike<T>) {
    return q.run(world)
  }

  function mut<C extends Component>(component: C) {
    storage.incrementVersion(component)
    return component as Mutable<C>
  }

  const { addTag, removeTag, hasTag, registerComponentFactory } = storage

  const world: World<T> = {
    create,
    insert,
    destroy,
    tick,
    created,
    destroyed,
    storage,
    query,
    isEphemeral,
    addTag,
    removeTag,
    hasTag,
    mut,
    registerComponentFactory,
  }

  return world
}
