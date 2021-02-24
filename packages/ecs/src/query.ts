import { Archetype } from "./archetype"
import { Component, ComponentOf, ComponentType } from "./component"
import { ComponentFilter } from "./filter"
import { arrayOf } from "./util/array"
import { World } from "./world"

export type Selector = (ComponentType | ComponentFilter)[]
export type SelectorResult<S extends Selector> = {
  [K in keyof S]: S[K] extends ComponentFilter
    ? ComponentOf<S[K]["componentType"]>
    : S[K] extends ComponentType
    ? ComponentOf<S[K]>
    : never
}
export type Query<S extends Selector> = (
  world: World,
) => {
  [Symbol.iterator](): {
    next(): IteratorYieldResult<QueryResult<S>>
  }
}
export type QueryResult<S extends Selector> = [number, SelectorResult<S>]

/**
 * Create a Query with a given set of component types.
 *
 * @param selector Component makeup of entities
 */
export function query<S extends Selector>(...selector: S): Query<S> {
  const filters = selector.map(s =>
    "componentPredicate" in s ? s.componentPredicate : null,
  )
  const queryLength = selector.length
  const queryLayout = selector.map(s =>
    "componentType" in s ? s.componentType.type : s.type,
  )
  // Temporary array of components yielded by the query. This array is reused
  // for each resulting tuple, meaning it should not be stored by the consumer
  // between iterations (unless copied, i.e. results.slice()).
  const selectorResult = arrayOf(queryLength) as SelectorResult<S>
  const queryResult: QueryResult<S> = [-1, selectorResult]
  // Temporary array of integers where each index corresponds to the index of
  // the outgoing component (i.e. queryLayout index), and each value
  // corresponds to the index of that component in the archetype currently
  // being iterated. This lets us map the components to the correct index in
  // queryResult.
  const readIndicesByArchetypeIndex: (number[] | null)[] = []
  let currentArchetypeReadIndices: number[] | null

  let world: World
  let archetypes: ReadonlyArray<Archetype>
  let archetype: Archetype | null
  let archetypeIndex = -1
  let entityIndex = -1

  const result: IteratorResult<QueryResult<S>> = {
    value: queryResult as QueryResult<S>,
    done: false,
  }

  function loadNextResult() {
    const { table, entities } = archetype!
    const length = entities.length

    outer: while (++entityIndex < length) {
      queryResult[0] = entities[entityIndex]

      for (let i = 0; i < queryLength; i++) {
        const component = table[currentArchetypeReadIndices![i]][entityIndex]!

        if (filters[i]?.(component, world) ?? component.cst === 2) {
          ;(selectorResult as Component[])[i] = component
        } else {
          continue outer
        }
      }

      return
    }

    goToNextArchetype()
  }

  function goToNextArchetype() {
    outer: while ((archetype = archetypes[++archetypeIndex])) {
      currentArchetypeReadIndices = readIndicesByArchetypeIndex[archetypeIndex]

      if (currentArchetypeReadIndices === null) {
        continue outer
      }

      entityIndex = -1

      loadNextResult()
      return
    }

    result.done = true
  }

  const iterator = {
    next() {
      if (archetype === null) {
        goToNextArchetype()
      } else {
        loadNextResult()
      }

      return result
    },
  }

  const iterable = {
    [Symbol.iterator]() {
      return iterator
    },
  }

  return (nextWorld: World) => {
    world = nextWorld
    archetypes = nextWorld.storage.archetypes
    archetype = null
    archetypeIndex = -1
    entityIndex = -1
    result.done = false

    for (let i = 0; i < archetypes.length; i++) {
      const { layoutInverse } = archetypes[i]

      let indices: number[] | null = readIndicesByArchetypeIndex[i] || []

      for (let j = 0; j < queryLength; j++) {
        const index = layoutInverse[queryLayout[j]]

        if (index === undefined) {
          indices = null
          break
        }

        indices[j] = index
      }

      readIndicesByArchetypeIndex[i] = indices
    }

    return iterable
  }
}
