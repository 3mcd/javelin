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

/**
 * A list of schemas that defines the signature of a query's results.
 * @example
 * const particle: Selector = [Position, Color]
 */
export type Selector = Schema[]

/**
 * An array of schema instances that corresponds to a selector.
 * @example
 * const results: SelectorResult<[Position, Color]> = [
 *   { x: 0, y: 0 },
 *   { value: 0xff0000 }
 * ]
 */
export type SelectorResult<S extends Selector> = {
  [K in keyof S]: S[K] extends Schema ? ComponentOf<S[K]> : Component
}

/**
 * A "sparse" `SelectorResult` where each value can be null.
 * @example
 * const results: SelectorResultSparse<[Position, Color]> = [
 *   null,
 *   { value: 0xff0000 }
 * ]
 */
export type SelectorResultSparse<S extends Selector> = {
  [K in keyof S]: (S[K] extends Schema ? ComponentOf<S[K]> : Component) | null
}

/**
 * A subset of selector `S`.
 * @example
 * const subset: SelectorSubset<[Position, Color]> = [Color]
 */
export type SelectorSubset<S extends Selector> = (S extends Array<infer _>
  ? _
  : never)[]

/**
 * A record generated from an archetype with live references to the
 * archetype's entities and component data.
 */
export type QueryRecord<S extends Selector> = [
  entities: ReadonlyArray<number>,
  columns: {
    [K in keyof S]: S[K] extends Schema ? ArchetypeTableColumn<S[K]> : never
  },
  entityLookup: ReadonlyArray<number>,
]

/**
 * A function used to iterate a query using the `query(fn)` syntax.
 * @example
 * const iteratee: QueryIteratee<[Position, Color]> = (entity, [position, color]) => {
 *   // ...
 * }
 */
export type QueryIteratee<S extends Selector> = (
  entity: Entity,
  components: SelectorResult<S>,
) => unknown

/**
 * A live-updating, iterable collection of entity-components records that match
 * a provided selector (list of schemas).
 */
export type Query<S extends Selector = Selector> = ((
  callback: QueryIteratee<S>,
) => void) & {
  signature: number[]
  filters: QueryFilters

  [Symbol.iterator](): IterableIterator<QueryRecord<S>>

  /**
   * Create a new query that excludes entities with components of provided
   * component type(s) from this query's results.
   */
  not(...selector: Selector): Query<S>

  /**
   * Create a new query that behaves the same as this query, but yields a
   * specified subset of components.
   */
  select<T extends SelectorSubset<S>>(...include: T): Query<T>

  /**
   * Get the results of a query for a specific entity.
   */
  get(entity: Entity, out?: SelectorResult<S>): SelectorResult<S>

  /**
   * Determine if an entity matches the query.
   */
  test(entity: Entity): boolean

  /**
   * Bind the results of this query to a specific world.
   */
  bind(world: World): Query<S>

  /**
   * Determine if this query matches an archetype.
   */
  matchesArchetype(archetype: Archetype): boolean

  /**
   * Determine if this query equals another query.
   */
  equals(query: Query): boolean

  match(
    components: Component[],
    out?: SelectorResultSparse<S>,
  ): SelectorResultSparse<S>
}

type QueryFilters = {
  not: Set<number>
}

/**
 * Determine if a query signature (type) matches an archetype signature,
 * accounting for query filters (if any).
 */
function matches(type: Type, filters: QueryFilters, archetype: Archetype) {
  return (
    typeIsSuperset(archetype.signature, type) &&
    archetype.signature.every(c => !filters.not.has(c))
  )
}

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
  const pool = createStackPool<SelectorResult<S>>(
    () => [] as unknown as SelectorResult<S>,
    components => {
      mutableEmpty(components)
      return components
    },
    1000,
  )

  let context = options.context

  /**
   * Attempt to register an archetype with this query. If the archetype is
   * matched, a live record of the archetype's entities, columns, and entity
   * index is pushed into the query's registry.
   */
  function maybeRegisterArchetype(
    archetype: Archetype,
    records: QueryRecord<S>[],
  ) {
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

  /**
   * Create a new index of archetype records for the provided world, attempt
   * register existing archetypes, and subscribe to newly created ones.
   */
  function registerWorld(worldId: number) {
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

  function forEach(iteratee: QueryIteratee<S>) {
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

  function iterator() {
    const c = context ?? UNSAFE_internals.currentWorldId
    assert(c !== null && c !== -1, ERROR_MSG_UNBOUND_QUERY, ErrorType.Query)
    const iterator = (recordsIndex[c] || registerWorld(c))[Symbol.iterator]()

    return iterator
  }

  function not(...exclude: Selector) {
    return createQueryInternal({
      ...options,
      filters: {
        not: new Set(
          exclude
            .map(schema => UNSAFE_internals.schemaIndex.get(schema))
            .filter((x): x is number => typeof x === "number"),
        ),
      },
    })
  }

  function select<T extends SelectorSubset<S>>(...include: T) {
    return createQueryInternal({
      ...options,
      include,
    }) as unknown as Query<T>
  }

  function get(
    entity: Entity,
    out: SelectorResult<S> = [] as unknown as SelectorResult<S>,
  ) {
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

  function bind(world: World) {
    return createQueryInternal({
      ...options,
      context: world.id,
    })
  }

  function test(entity: Entity) {
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

  function matchesArchetype(archetype: Archetype) {
    return matches(signature, filters, archetype)
  }

  function equals(query: Query) {
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

  function match(
    components: Component[],
    out: SelectorResultSparse<S> = [] as unknown as SelectorResultSparse<S>,
  ): SelectorResultSparse<S> {
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

  const query = forEach as Query<S>
  query[Symbol.iterator] = iterator
  query.signature = signature
  query.filters = filters
  query.not = not
  query.select = select
  query.get = get
  query.bind = bind
  query.test = test
  query.matchesArchetype = matchesArchetype
  query.equals = equals
  query.match = match

  return query
}

/**
 * Create a query that can be used to iterate entities that match a selector.
 * Maintains a live-updating cache of entities, and can be used across multiple
 * worlds.
 * @example
 * const burning = createQuery(Player, Burn)
 * burning.forEach((entity, [player, burn]) => {
 *   player.health -= burn.damage
 * })
 */
export function createQuery<S extends Selector>(...selector: S): Query<S> {
  return createQueryInternal({
    select: selector,
  })
}
