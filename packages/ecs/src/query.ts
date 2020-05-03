import { Archetype } from "./archetype"
import { ComponentsOf, ComponentSpec, Component } from "./component"
import { Storage } from "./storage"
import { arrayOf } from "./util/array"

export interface QueryFilterLike {
  match(component: Component, storage: Storage): boolean
}

export interface QueryLike<T extends ComponentSpec[]> {
  run(
    storage: Storage,
    ...filters: QueryFilterLike[]
  ): IterableIterator<ComponentsOf<T>>
}

export function createQuery<T extends ComponentSpec[]>(
  ...componentSpecs: T
): QueryLike<T> {
  const selectorLength = componentSpecs.length
  const queryLayout = componentSpecs.map(s => s.type)
  const tmpResult = arrayOf(selectorLength) as ComponentsOf<T>
  const tmpReadIndices: number[] = []

  function* run(storage: Storage, ...filters: QueryFilterLike[]) {
    const { archetypes } = storage

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]

      let match = true

      for (let j = 0; j < queryLayout.length; j++) {
        if (archetype.layout.indexOf(queryLayout[j]) === -1) {
          match = false
          break
        }
      }

      if (!match) {
        continue
      }

      // Calculate the index of each outgoing component.
      for (let i = 0; i < selectorLength; i++) {
        tmpReadIndices[i] = (archetype as Archetype).layout.indexOf(
          queryLayout[i],
        )
      }

      for (let i = 0; i < archetype.entities.length; i++) {
        const index = archetype.indices[archetype.entities[i]]

        let match = true

        for (let j = 0; j < queryLayout.length; j++) {
          const component = archetype.table[tmpReadIndices[j]][index]!

          for (let f = 0; f < filters.length; f++) {
            match = filters[f].match(component, storage)
            if (!match) break
          }
          if (!match) break

          tmpResult[j] = component
        }

        if (match) {
          yield tmpResult
        }
      }
    }
  }

  return { run }
}
