import { assert, ErrorType, mutableEmpty, Schema } from "@javelin/model"
import { Archetype, ArchetypeTableColumn } from "./archetype"
import {
  Component,
  ComponentOf,
  ComponentType,
  registerComponentType,
} from "./component"
import { Entity } from "./entity"
import { UNSAFE_internals } from "./internal"
import { $componentType } from "./internal/symbols"
import { createStackPool } from "./pool"
import { Type, typeIsSuperset } from "./type"
import { World } from "./world"

const ERROR_MSG_UNBOUND_QUERY =
  "a query must be executed within a system or bound to a world using Query.bind()"

export type Selector = Schema[]
export type SelectorResult<S extends Selector> = {
  [K in keyof S]: S[K] extends Schema ? ComponentOf<S[K]> : Component
}
export type SelectorSubset<S extends Selector> = (S extends Array<infer _>
  ? _
  : never)[]

export type QueryRecord<S extends Selector> = [
  entities: ReadonlyArray<number>,
  columns: {
    [K in keyof S]: S[K] extends ComponentType
      ? ArchetypeTableColumn<S[K]>
      : never
  },
  entityLookup: ReadonlyArray<number>,
]
export type QueryForEachRecord<S extends Selector> = [
  entity: number,
  selectorResult: SelectorResult<S>,
]
export type QueryIteratee<S extends Selector> = (
  entity: Entity,
  components: SelectorResult<S>,
) => unknown
export type Query<S extends Selector = Selector> = ((
  callback: QueryIteratee<S>,
) => void) & {
  [Symbol.iterator](): IterableIterator<QueryRecord<S>>

  /**
   * Exclude entities with components of provided component type(s) from the
   * query results.
   * @param selector
   */
  not(...selector: Selector): Query<S>

  select<T extends SelectorSubset<S>>(...subset: T): Query<T>

  get(entity: Entity, out: SelectorResult<S>): boolean

  /**
   * Determine if an entity test the query.
   * @param entity
   */
  test(entity: Entity): boolean

  bind(world: World): Query<S>
}

type QueryFilters = {
  not: Set<number>
}

export const matches = (
  type: Type,
  filters: QueryFilters,
  archetype: Archetype,
) =>
  typeIsSuperset(archetype.signature, type) &&
  archetype.signature.every(c => !filters.not.has(c))

type QueryFactoryOptions<S extends Selector> = {
  select: S
  include?: SelectorSubset<S>
  filters?: {
    not: Set<number>
  }
  context?: number
}

function createQueryInternal<S extends Selector>(
  options: QueryFactoryOptions<S>,
) {
  const length = options.select.length
  const filters = options.filters ?? { not: new Set() }
  const signature = options.select.map(schema => {
    registerComponentType(schema)
    return schema[$componentType]
  })
  const layout = (options.include ?? options.select).map(
    (schema: Schema) => (schema as ComponentType)[$componentType],
  )
  const recordsIndex = [] as QueryRecord<S>[][]

  let context = options.context

  const maybeRegisterArchetype = (
    archetype: Archetype,
    records: QueryRecord<S>[],
  ) => {
    if (matches(signature, filters, archetype)) {
      const columns = layout.map(
        componentTypeId =>
          archetype.table[archetype.signature.indexOf(componentTypeId)],
      )
      records.push([
        archetype.entities,
        columns as QueryRecord<S>[1],
        archetype.indices,
      ])
    }
  }
  const registerWorld = (worldId: number) => {
    const world = UNSAFE_internals.__WORLDS__[worldId]
    const records: QueryRecord<S>[] = []
    recordsIndex[worldId] = records
    world.storage.archetypes.forEach(archetype =>
      maybeRegisterArchetype(archetype, records),
    )
    world.storage.archetypeCreated.subscribe(archetype =>
      maybeRegisterArchetype(archetype, records),
    )
    return records
  }
  const pool = createStackPool<SelectorResult<S>>(
    () => ([] as unknown) as SelectorResult<S>,
    components => {
      mutableEmpty(components)
      return components
    },
    1000,
  )
  const forEach = (iteratee: QueryIteratee<S>) => {
    const c = context ?? UNSAFE_internals.__CURRENT_WORLD__
    assert(c !== null && c !== -1, ERROR_MSG_UNBOUND_QUERY, ErrorType.Query)
    const records = recordsIndex[c] || registerWorld(c)
    const components = pool.retain()

    for (let i = 0; i < records.length; i++) {
      const [entities, columns] = records[i]
      for (let j = 0; j < entities.length; j++) {
        for (let k = 0; k < length; k++) {
          components[k] = columns[k][j]
        }
        iteratee(entities[j], components)
      }
    }

    pool.release(components)
  }

  const query = forEach as Query<S>

  query.not = (...exclude: Selector) =>
    createQueryInternal({
      ...options,
      filters: {
        not: new Set(
          exclude.map(schema => (schema as ComponentType)[$componentType]),
        ),
      },
    })
  query.select = <T extends SelectorSubset<S>>(...include: T) =>
    (createQueryInternal({
      ...options,
      include,
    }) as unknown) as Query<T>
  query.get = (entity: Entity, out: SelectorResult<S>) => {
    const c = context ?? UNSAFE_internals.__CURRENT_WORLD__
    const records = recordsIndex[c]
    for (let i = 0; i < records.length; i++) {
      const [, columns, indices] = records[i]
      const index = indices[entity]
      if (index !== undefined) {
        for (let i = 0; i < columns.length; i++) {
          out[i] = columns[i][index]
        }
        return true
      }
    }
    return false
  }
  query.bind = (world: World) =>
    createQueryInternal({
      ...options,
      context: world.id,
    })
  query.test = (entity: Entity) => {
    const c = context ?? UNSAFE_internals.__CURRENT_WORLD__
    const records = recordsIndex[c]
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      if (record[2][entity] !== undefined) {
        return true
      }
    }
    return false
  }
  query[Symbol.iterator] = () => {
    const c = context ?? UNSAFE_internals.__CURRENT_WORLD__
    assert(c !== null && c !== -1, ERROR_MSG_UNBOUND_QUERY, ErrorType.Query)
    const iterator = (recordsIndex[c] || registerWorld(c))[Symbol.iterator]()

    return iterator
  }

  return query
}

/**
 * Create a query that can be used to iterate over entities that match a
 * provided component type selector. Maintains an automatically-updated
 * cache of archetypes, and can be used across multiple worlds.
 * @param selector Query selector
 * @returns Query
 * @example
 * const burning = createQuery(Player, Burn)
 * burning.forEach((entity, [player, burn]) => {
 *   player.health -= burn.damage
 * })
 */
export const createQuery = <S extends Selector>(...select: S): Query<S> =>
  createQueryInternal({
    select,
  })
