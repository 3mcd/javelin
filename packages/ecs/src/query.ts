import { Archetype, ArchetypeTableColumn } from "./archetype"
import { Component, ComponentOf, ComponentType } from "./component"
import { globals } from "./internal/globals"
import { createStackPool } from "./pool"
import { typeIsSuperset } from "./type"
import { mutableEmpty } from "./util"
import { World } from "./world"

export type Selector = ComponentType[]
export type SelectorResult<S extends Selector> = {
  [K in keyof S]: S[K] extends ComponentType ? ComponentOf<S[K]> : Component
}

export type QueryResult<S extends Selector> = [number, ...SelectorResult<S>]
export type QueryIteratee<S extends Selector> = (
  entity: number,
  selectorResult: SelectorResult<S>,
) => void
export type Query<S extends Selector> = {
  forEach(callback: QueryIteratee<S>): void
}

type QueryCachedArchetypeRecord = {
  archetype: Archetype
  columns: ArchetypeTableColumn[]
}

export function query<S extends Selector>(...selector: S): Query<S> {
  const queryLength = selector.length
  const queryLayout = selector.map(s => s.type)
  const querySignature = queryLayout.slice().sort()
  const recordsByWorld = new Map<World, QueryCachedArchetypeRecord[]>()
  const maybeAddArchetypeRecord = (
    archetype: Archetype,
    records: QueryCachedArchetypeRecord[],
  ) => {
    if (typeIsSuperset(archetype.signature, querySignature)) {
      const columns = queryLayout.map(
        componentTypeId =>
          archetype.table[archetype.signature.indexOf(componentTypeId)],
      )
      records.push({ archetype, columns })
    }
  }
  const registerWorld = (world: World) => {
    const records: QueryCachedArchetypeRecord[] = []
    recordsByWorld.set(world, records)
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
    forEach(callback: QueryIteratee<S>) {
      const world = globals.__WORLDS__[globals.__CURRENT_WORLD__]
      const records = recordsByWorld.get(world) || registerWorld(world)
      const components = pool.retain()

      for (let i = 0; i < records.length; i++) {
        const { archetype, columns } = records[i]
        const { entities } = archetype
        for (let j = 0; j < entities.length; j++) {
          for (let k = 0; k < queryLength; k++) {
            components[k] = columns[k][j]
          }
          callback(entities[j], components)
        }
      }

      pool.release(components)
    },
  }
}
