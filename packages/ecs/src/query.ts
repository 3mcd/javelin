import {
  assert,
  createStackPool,
  ErrorType,
  mutableEmpty,
  Schema,
} from "@javelin/core"
import { Archetype, ArchetypeTableColumn } from "./archetype"
import { Component, ComponentOf, registerSchema } from "./component"
import { Entity } from "./entity"
import { UNSAFE_internals } from "./internal"
import { Type, typeIsSuperset } from "./type"
import { World } from "./world"

const ERROR_MSG_UNBOUND_QUERY =
  "a query must be executed within a system or bound to a world using Query.bind()"

export type Selector = Schema[]
export type SelectorResult<S extends Selector> = {
  [K in keyof S]: S[K] extends Schema ? ComponentOf<S[K]> : Component
}
export type SelectorResultSparse<S extends Selector> = {
  [K in keyof S]: (S[K] extends Schema ? ComponentOf<S[K]> : Component) | null
}
export type SelectorSubset<S extends Selector> = (S extends Array<infer _>
  ? _
  : never)[]

export type QueryRecord<S extends Selector> = [
  entities: ReadonlyArray<number>,
  columns: {
    [K in keyof S]: S[K] extends Schema ? ArchetypeTableColumn<S[K]> : never
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
  signature: number[]
  filters: QueryFilters

  [Symbol.iterator](): IterableIterator<QueryRecord<S>>

  /**
   * Create a new query that excludes entities with components of provided
   * component type(s) from this query's results.
   * @param selector
   */
  not(...selector: Selector): Query<S>

  /**
   * Create a new query that behaves the same as this query, but yields a
   * specified subset of components.
   * @param include
   */
  select<T extends SelectorSubset<S>>(...include: T): Query<T>

  /**
   * Get the results of a query for a specific entity.
   * @param entity
   * @param out
   */
  get(entity: Entity, out?: SelectorResult<S>): SelectorResult<S>

  /**
   * Determine if an entity matches the query.
   * @param entity
   */
  test(entity: Entity): boolean

  /**
   * Bind the results of this query to a specific world.
   * @param world
   */
  bind(world: World): Query<S>

  /**
   * Determine if a query matches an archetype.
   * @param archetype
   */
  matchesArchetype(archetype: Archetype): boolean

  equals(query: Query): boolean

  match(
    components: Component[],
    out?: SelectorResultSparse<S>,
  ): SelectorResultSparse<S>
}

type QueryFilters = {
  not: Set<number>
}

const matches = (type: Type, filters: QueryFilters, archetype: Archetype) =>
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
  const signature = options.select
    .map(schema => registerSchema(schema))
    .sort((a, b) => a - b)
  const layout = (options.include ?? options.select).map((schema: Schema) =>
    registerSchema(schema),
  )
  const recordsIndex = [] as QueryRecord<S>[][]

  let context = options.context

  const maybeRegisterArchetype = (
    archetype: Archetype,
    records: QueryRecord<S>[],
  ) => {
    if (matches(signature, filters, archetype)) {
      const columns = layout.map(
        schemaId => archetype.table[archetype.signature.indexOf(schemaId)],
      )
      records.push([
        archetype.entities,
        columns as QueryRecord<S>[1],
        archetype.indices,
      ])
    }
  }
  const registerWorld = (worldId: number) => {
    const world = UNSAFE_internals.worlds[worldId]
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
    () => [] as unknown as SelectorResult<S>,
    components => {
      mutableEmpty(components)
      return components
    },
    1000,
  )
  const forEach = (iteratee: QueryIteratee<S>) => {
    const c = context ?? UNSAFE_internals.currentWorldId
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
  query.signature = signature
  query.filters = filters
  query.not = (...exclude: Selector) =>
    createQueryInternal({
      ...options,
      filters: {
        not: new Set(
          exclude
            .map(schema => UNSAFE_internals.schemaIndex.get(schema))
            .filter((x): x is number => typeof x === "number"),
        ),
      },
    })
  query.select = <T extends SelectorSubset<S>>(...include: T) =>
    createQueryInternal({
      ...options,
      include,
    }) as unknown as Query<T>
  query.get = (
    entity: Entity,
    out: SelectorResult<S> = [] as unknown as SelectorResult<S>,
  ) => {
    const c = context ?? UNSAFE_internals.currentWorldId
    const records = recordsIndex[c]
    for (let i = 0; i < records.length; i++) {
      const [, columns, indices] = records[i]
      const index = indices[entity]
      if (index !== undefined) {
        for (let i = 0; i < columns.length; i++) {
          out[i] = columns[i][index]
        }
        return out
      }
    }
    throw new Error(
      "Failed to get components of query: entity does not match query",
    )
  }
  query.bind = (world: World) =>
    createQueryInternal({
      ...options,
      context: world.id,
    })
  query.test = (entity: Entity) => {
    const c = context ?? UNSAFE_internals.currentWorldId
    const records = recordsIndex[c]
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      if (record[2][entity] !== undefined) {
        return true
      }
    }
    return false
  }
  query.matchesArchetype = (archetype: Archetype) =>
    matches(signature, filters, archetype)
  query[Symbol.iterator] = () => {
    const c = context ?? UNSAFE_internals.currentWorldId
    assert(c !== null && c !== -1, ERROR_MSG_UNBOUND_QUERY, ErrorType.Query)
    const iterator = (recordsIndex[c] || registerWorld(c))[Symbol.iterator]()

    return iterator
  }
  query.equals = (query: Query) => {
    if (query.signature.length !== signature.length) {
      return false
    }
    for (let i = 0; i < query.signature.length; i++) {
      if (query.signature[i] !== signature[i]) {
        return false
      }
    }
    if (query.filters.not.size !== filters.not.size) {
      return false
    }
    let result = true
    query.filters.not.forEach(
      schemaId => (result = result && filters.not.has(schemaId)),
    )
    return result
  }
  query.match = (
    components: Component[],
    out: SelectorResultSparse<S> = [] as unknown as SelectorResultSparse<S>,
  ): SelectorResultSparse<S> => {
    for (let i = 0; i < layout.length; i++) {
      out[i] = null
    }
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const index = layout.indexOf(component.__type__)
      if (index !== -1) {
        out[index] = component
      }
    }
    return out as SelectorResultSparse<S>
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
export const createQuery = <S extends Selector>(...selector: S): Query<S> =>
  createQueryInternal({
    select: selector,
  })
