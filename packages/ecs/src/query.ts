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
export type QueryResult<S extends Selector> = [number, SelectorResult<S>]

/**
 * Create a Query with a given set of component types.
 *
 * @param selector Component makeup of entities
 */
export function query<S extends Selector>(...selector: S) {
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
  let readIndex = -1

  const result: IteratorResult<QueryResult<S>> = {
    value: queryResult as QueryResult<S>,
    done: false,
  }

  function loadNextResult() {
    const { table, entitiesByIndex } = archetype!
    const [col0] = table

    outer: while (col0[++readIndex]) {
      queryResult[0] = entitiesByIndex[readIndex]

      for (let k = 0; k < queryLength; k++) {
        const filter = filters[k]
        const component = table[tmpReadIndices[k]][readIndex]!

        if (
          filter
            ? filter(component, world) === false
            : (component as any)[$detached]
        ) {
          continue outer
        }

        ;(selectorResult as any)[k] = component
      }

      return
    }

    goToNextArchetype()
  }

  function goToNextArchetype() {
    let visiting: Archetype

    outer: while ((visiting = archetypes[++archetypeIndex])) {
      const { layout } = visiting

      archetype = visiting
      readIndex = -1

      for (let i = 0; i < queryLength; i++) {
        const index = layout.indexOf(queryLayout[i])

        if (index === -1) {
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
    readIndex = -1
    result.done = false

    return iterable
  }
}
