import { Archetype, ArchetypeTableColumn } from "./archetype"
import { Component, ComponentOf, ComponentType } from "./component"
import { createComponentType } from "./helpers"
import { globals } from "./internal/globals"
import { createStackPool } from "./pool"
import { number } from "./schema"
import { typeIsSuperset } from "./type"
import { mutableEmpty } from "./util"

export type Selector = ComponentType[]
export type SelectorResult<S extends Selector> = {
  [K in keyof S]: S[K] extends ComponentType ? ComponentOf<S[K]> : Component
}

export type QueryForEachIteratee<S extends Selector> = (
  entity: number,
  selectorResult: SelectorResult<S>,
) => void
export type QueryIteratorResult<S extends Selector> = [
  number,
  ...SelectorResult<S>
]
export type QueryRecord<S extends Selector> = [
  entities: ReadonlyArray<number>,
  columns: {
    [K in keyof S]: S[K] extends ComponentType
      ? ArchetypeTableColumn<S[K]>
      : never
  },
]
export type Query<S extends Selector> = {
  /**
   * Iterate over the query's matching entities, executing the provided
   * iteratee for each entity-component array pair.
   * @param iteratee Function executed for each query result
   */
  forEach(iteratee: QueryForEachIteratee<S>): void

  /**
   * Underlying query records. Useful if you need to manually iterate a query.
   * @example
   * for (const {} of burning) {
   *
   * }
   */
  readonly records: ReadonlyArray<QueryRecord<S>>

  [Symbol.iterator](): IterableIterator<QueryRecord<S>>
}

/**
 * Create a query that can be used to iterate over entities that match a
 * provided component type selector. Maintains an automatically-updated
 * cache of archetypes, and can be used across multiple worlds.
 * @param selector Query selector
 * @returns Query
 * @example
 * const burning = query(Player, Burn)
 * burning.forEach((entity, [player, burn]) => {
 *   player.health -= burn.damage
 * })
 */
export function query<S extends Selector>(...selector: S): Query<S> {
  const queryLength = selector.length
  const queryLayout = selector.map(s => s.type)
  const querySignature = queryLayout.slice().sort()
  const recordsByWorldId = [] as QueryRecord<S>[][]
  const maybeAddArchetypeRecord = (
    archetype: Archetype,
    records: QueryRecord<S>[],
  ) => {
    if (typeIsSuperset(archetype.signature, querySignature)) {
      const columns = queryLayout.map(
        componentTypeId =>
          archetype.table[archetype.signature.indexOf(componentTypeId)],
      )
      records.push([archetype.entities, columns as QueryRecord<S>[1]])
    }
  }
  const registerWorld = (worldId: number) => {
    const world = globals.__WORLDS__[worldId]
    const records: QueryRecord<S>[] = []
    recordsByWorldId[worldId] = records
    world.storage.archetypes.forEach(archetype =>
      maybeAddArchetypeRecord(archetype, records),
    )
    world.storage.archetypeCreated.subscribe(archetype =>
      maybeAddArchetypeRecord(archetype, records),
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

  return {
    forEach(iteratee: QueryForEachIteratee<S>) {
      const records =
        recordsByWorldId[globals.__CURRENT_WORLD__] ||
        registerWorld(globals.__CURRENT_WORLD__)
      const components = pool.retain()

      for (let i = 0; i < records.length; i++) {
        const [entities, columns] = records[i]
        for (let j = 0; j < entities.length; j++) {
          for (let k = 0; k < queryLength; k++) {
            components[k] = columns[k][j]
          }
          iteratee(entities[j], components)
        }
      }

      pool.release(components)
    },
    get records() {
      return (
        recordsByWorldId[globals.__CURRENT_WORLD__] ||
        registerWorld(globals.__CURRENT_WORLD__)
      )
    },
    [Symbol.iterator]() {
      return (recordsByWorldId[globals.__CURRENT_WORLD__] ||
        registerWorld(globals.__CURRENT_WORLD__))[Symbol.iterator]()
    },
  }
}
