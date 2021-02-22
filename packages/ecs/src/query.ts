import { Archetype } from "./archetype"
import { ComponentOf, ComponentType, Component } from "./component"
import { ComponentFilter } from "./filter"
import { $worldStorageKey, $detached } from "./symbols"
import { arrayOf, mutableEmpty } from "./util/array"
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

function writeQueryResult<S extends Selector>(
  out: SelectorResult<S>,
  readIndices: number[],
  components: readonly Component[],
  filters: (ComponentFilter["componentPredicate"] | null)[],
  world: World,
) {
  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i]
    const readIndex = readIndices[i]
    const component = components[readIndex]

    if (
      filter === null
        ? (component as any)[$detached] === true
        : filter(component, world) === false
    ) {
      return null
    }
    ;(out as any)[i] = component
  }

  return out
}

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
  const tmpReadIndices: number[] = []

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
    const { table, entities, layoutSize } = archetype!
    const length = entities.length

    outer: while (++entityIndex < length) {
      const start = entityIndex * layoutSize

      queryResult[0] = entities[entityIndex]

      for (let i = 0; i < queryLength; i++) {
        const filter = filters[i]
        const component = table[start + tmpReadIndices[i]]

        if (
          filter === null
            ? (component as any)[$detached] === true
            : filter(component, world) === false
        ) {
          continue outer
        }

        ;(selectorResult as any)[i] = component as Component
      }

      return
    }

    goToNextArchetype()
  }

  function goToNextArchetype() {
    let visiting: Archetype

    outer: while ((visiting = archetypes[++archetypeIndex])) {
      const { indexByType } = visiting

      archetype = visiting
      entityIndex = -1

      for (let i = 0; i < queryLength; i++) {
        const index = indexByType[queryLayout[i]]

        if (index === undefined) {
          continue outer
        }

        tmpReadIndices[i] = index
      }

      loadNextResult()
      return
    }

    result.done = true
    queryResult[0] = -1
    mutableEmpty(selectorResult)
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
    archetypes = nextWorld[$worldStorageKey].archetypes
    archetype = null
    archetypeIndex = -1
    entityIndex = -1
    result.done = false

    return iterable
  }
}
