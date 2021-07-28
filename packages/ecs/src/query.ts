import {
  assert,
  createStackPool,
  ErrorType,
  mutableEmpty,
  Schema,
} from "@javelin/core"
import { Archetype, ComponentStoreColumn } from "./archetype"
import {
  Component,
  ComponentOf,
  getSchemaId,
  registerSchema,
} from "./component"
import { Entity } from "./entity"
import { UNSAFE_internals } from "./internal"
import { normalizeType, Type, typeIsSuperset } from "./type"
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
 * An array of component instances that matches a selector.
 * @example
 * const results: SelectorResult<[Position, Color]> = [
 *   { x: 0, y: 0 },
 *   { value: 0xff0000 }
 * ]
 */
export type SelectorResult<$Selector extends Selector> = {
  [K in keyof $Selector]: $Selector[K] extends Schema
    ? ComponentOf<$Selector[K]>
    : Component
}

/**
 * A "holey" `SelectorResult` where empty values are null.
 * @example
 * const results: SelectorResultSparse<[Position, Color]> = [
 *   null,
 *   { value: 0xff0000 }
 * ]
 */
export type SelectorResultSparse<$Selector extends Selector> = {
  [K in keyof $Selector]:
    | ($Selector[K] extends Schema ? ComponentOf<$Selector[K]> : Component)
    | null
}

/**
 * A subset of selector `$Selector`.
 * @example
 * const subset: SelectorSubset<[Position, Color]> = [Color]
 */
export type SelectorSubset<$Selector extends Selector> =
  ($Selector extends Array<infer _> ? _ : never)[]

/**
 * A record generated from an archetype with live references to the
 * archetype's entities and component data.
 */
export type QueryRecord<$Selector extends Selector> = [
  entities: ReadonlyArray<number>,
  columns: {
    [K in keyof $Selector]: $Selector[K] extends Schema
      ? ComponentStoreColumn<$Selector[K]>
      : never
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
export type QueryIteratee<$Selector extends Selector> = (
  entity: Entity,
  components: SelectorResult<$Selector>,
) => unknown

/**
 * A live-updating, iterable collection of entity-components records that match
 * a provided selector (list of schemas).
 */
export type Query<$Selector extends Selector = Selector> = ((
  callback: QueryIteratee<$Selector>,
) => void) & {
  /**
   * The type signature of the query.
   */
  type: Type

  /**
   * Query filters.
   */
  filters: QueryFilters

  [Symbol.iterator](): IterableIterator<QueryRecord<$Selector>>

  /**
   * Create a new query that excludes entities with components of provided
   * component type(s) from this query's results.
   */
  not(...selector: Selector): Query<$Selector>

  /**
   * Create a new query that behaves the same as this query, but yields a
   * specified subset of components.
   */
  select<T extends SelectorSubset<$Selector>>(...include: T): Query<T>

  /**
   * Get the results of a query for a specific entity.
   */
  get(
    entity: Entity,
    out?: SelectorResult<$Selector>,
  ): SelectorResult<$Selector>

  /**
   * Check if an entity matches the query.
   */
  test(entity: Entity): boolean

  /**
   * Bind the results of this query to a specific world.
   */
  bind(world: World): Query<$Selector>

  /**
   * Check if this query matches a type signature.
   */
  matchesType(type: Type): boolean

  /**
   * Check if this query equals another query.
   * @example
   * const a = createQuery(Enemy, EnemyAiState).not(Stun)
   * const b = createQuery(Enemy, EnemyAiState).not(Stun)
   * a.equals(b) // true
   * @example
   * const a = createQuery(Player)
   * const b = createQuery(Player).not(Burn)
   * a.equals(b) // false
   */
  equals(query: Query): boolean

  /**
   * Create a new array from a list of components where components that do
   * not match the query are replaced with `null`.
   * @example
   * const moving = createQuery(Position, Velocity)
   * const components = [component(Position), component(Health), component(Velocity)]
   * moving.match(components) // [{}, null, {}]
   */
  match(
    components: Component[],
    out?: SelectorResultSparse<$Selector>,
  ): SelectorResultSparse<$Selector>
}

type QueryFilters = {
  not: Set<number>
}

/**
 * Check if a query signature (type) matches a type signature, accounting for
 * query filters (if any).
 */
function matchesTypeInner(typeA: Type, typeB: Type, filters: QueryFilters) {
  return typeIsSuperset(typeB, typeA) && typeB.every(c => !filters.not.has(c))
}

type QueryFactoryOptions<$Selector extends Selector> = {
  select: $Selector
  include?: SelectorSubset<$Selector>
  filters?: {
    not: Set<number>
  }
  boundWorldId?: number
}

function createQueryInternal<$Selector extends Selector>(
  options: QueryFactoryOptions<$Selector>,
) {
  const length = options.select.length
  const filters = options.filters ?? { not: new Set() }
  const type = normalizeType(
    options.select.map(schema => registerSchema(schema)),
  )
  const layout = (options.include ?? options.select).map(schema =>
    registerSchema(schema),
  )
  const recordsIndex = [] as QueryRecord<$Selector>[][]
  const pool = createStackPool<SelectorResult<$Selector>>(
    () => [] as unknown as SelectorResult<$Selector>,
    components => {
      mutableEmpty(components)
      return components
    },
    1000,
  )

  let boundWorldId = options.boundWorldId

  /**
   * Attempt to register an archetype with this query. If the archetype is
   * matched, a live record of the archetype's entities, columns, and entity
   * index is pushed into the query's registry.
   */
  function maybeRegisterArchetype(
    archetype: Archetype,
    records: QueryRecord<$Selector>[],
  ) {
    if (matchesTypeInner(type, archetype.type, filters)) {
      const columns = layout.map(
        schemaId => archetype.table[archetype.type.indexOf(schemaId)],
      )
      records.push([
        archetype.entities,
        columns as QueryRecord<$Selector>[1],
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
    const records: QueryRecord<$Selector>[] = []
    recordsIndex[worldId] = records
    world.storage.archetypes.forEach(archetype =>
      maybeRegisterArchetype(archetype, records),
    )
    world.storage.archetypeCreated.subscribe(archetype =>
      maybeRegisterArchetype(archetype, records),
    )
    return records
  }

  function forEach(iteratee: QueryIteratee<$Selector>) {
    const worldId = boundWorldId ?? UNSAFE_internals.currentWorldId
    assert(
      worldId !== null && worldId !== -1,
      ERROR_MSG_UNBOUND_QUERY,
      ErrorType.Query,
    )
    const records = recordsIndex[worldId] || registerWorld(worldId)
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
    const worldId = boundWorldId ?? UNSAFE_internals.currentWorldId
    assert(
      worldId !== null && worldId !== -1,
      ERROR_MSG_UNBOUND_QUERY,
      ErrorType.Query,
    )
    return (recordsIndex[worldId] || registerWorld(worldId))[Symbol.iterator]()
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

  function select<T extends SelectorSubset<$Selector>>(...include: T) {
    return createQueryInternal({ ...options, include }) as unknown as Query<T>
  }

  function get(
    entity: Entity,
    out: SelectorResult<$Selector> = [] as unknown as SelectorResult<$Selector>,
  ) {
    const worldId = boundWorldId ?? UNSAFE_internals.currentWorldId
    const records = recordsIndex[worldId]
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
      boundWorldId: world.id,
    })
  }

  function test(entity: Entity) {
    const worldId = boundWorldId ?? UNSAFE_internals.currentWorldId
    const records = recordsIndex[worldId]
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      if (record[2][entity] !== undefined) {
        return true
      }
    }
    return false
  }

  let _type = type
  function matchesType(type: Type) {
    return matchesTypeInner(_type, type, filters)
  }

  function equals(query: Query) {
    if (query.type.length !== type.length) {
      return false
    }
    for (let i = 0; i < query.type.length; i++) {
      if (query.type[i] !== type[i]) {
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
    out: SelectorResultSparse<$Selector> = [] as unknown as SelectorResultSparse<$Selector>,
  ): SelectorResultSparse<$Selector> {
    for (let i = 0; i < layout.length; i++) {
      out[i] = null
    }
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const index = layout.indexOf(getSchemaId(component))
      if (index !== -1) {
        out[index] = component
      }
    }
    return out as SelectorResultSparse<$Selector>
  }

  const query = forEach as Query<$Selector>
  query[Symbol.iterator] = iterator
  query.type = type
  query.filters = filters
  query.not = not
  query.select = select
  query.get = get
  query.bind = bind
  query.test = test
  query.matchesType = matchesType
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
 * burning((entity, [player, burn]) => {
 *   player.health -= burn.damage
 * })
 * @example
 * for (const [entities, [p, b]] of burning) {
 *   for (let i = 0; i < entities.length; i++) {
 *     p[i].health -= b[i].damage
 *   }
 * }
 */
export function createQuery<$Selector extends Selector>(
  ...select: $Selector
): Query<$Selector> {
  return createQueryInternal({ select })
}
