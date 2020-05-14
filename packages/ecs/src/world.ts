import { Component, ComponentType } from "./component"
import { createStorage, Storage } from "./storage"
import { createStackPool } from "./pool/stack_pool"
import { QueryLike, Filter } from "./query"

type QueryMethod = <T extends ComponentType[]>(
  query: QueryLike<T>,
  ...filters: Filter[]
) => ReturnType<QueryLike<T>["run"]>

export type World<T = any> = {
  tick(data: T): void
  create(components: ReadonlyArray<Component>, tags?: number): number
  insert(entity: number, ...components: ReadonlyArray<Component>): void
  destroy(entity: number): void
  created: Set<number>
  destroyed: Set<number>
  storage: Storage
  query: QueryMethod
  queryEphemeral: QueryMethod
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

const opPool = createStackPool<WorldOp>(
  () => ([] as any) as WorldOp,
  op => op,
  1000,
)

export const createWorld = <T>(systems: System<T>[]): World<T> => {
  const ops: WorldOp[] = []
  const storage = createStorage()
  const created = new Set<number>()
  const destroyed = new Set<number>()

  let nextEntity = 0
  let op: WorldOp | undefined

  let i

  function tick(data: T) {
    // Clean up entities
    destroyed.forEach(storage.destroy)
    destroyed.clear()
    created.clear()

    // Process all world operations
    while ((op = ops.pop())) {
      switch (op[0]) {
        case WorldOpType.Create: {
          op[2].forEach(c => (c._e = op![1]))
          storage.create(op[1], op[2] as Component[], op[3])
          created.add(op[1])
          break
        }
        case WorldOpType.Insert: {
          op[2].forEach(c => (c._e = op![1]))
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

    // Execute all systems
    for (i = 0; i < systems.length; i++) {
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

    ops.unshift(op)

    return entity
  }

  function insert(entity: number, ...components: ReadonlyArray<Component>) {
    const op = opPool.retain() as InsertOp

    op[0] = WorldOpType.Insert
    op[1] = entity
    op[2] = components

    ops.unshift(op)
  }

  function destroy(entity: number) {
    const op = opPool.retain() as DestroyOp

    op[0] = WorldOpType.Destroy
    op[1] = entity

    ops.unshift(op)
  }

  const concreteFilter = {
    matchEntity(entity: number) {
      return !(created.has(entity) || destroyed.has(entity))
    },
    matchComponent() {
      return true
    },
  }

  function query<T extends ComponentType[]>(q: QueryLike<T>) {
    return q.filter(concreteFilter).run(world)
  }

  function queryEphemeral<T extends ComponentType[]>(q: QueryLike<T>) {
    return q.run(world)
  }

  const world: World<T> = {
    create,
    insert,
    destroy,
    tick,
    created,
    destroyed,
    storage,
    query,
    queryEphemeral,
  }

  return world
}
