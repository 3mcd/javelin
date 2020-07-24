import { Archetype } from "./archetype"
import { Component, ComponentsOf, ComponentType } from "./component"
import { $worldStorageKey } from "./symbols"
import { arrayOf, mutableEmpty } from "./util/array"
import { World } from "./world"

export type Selector = ComponentType[]

/**
 * A Filter is an object containing methods used to filter queries by entity
 * and component.
 */
export interface Filter {
  /**
   * Filter by entity. matchEntity should return true if the entity's
   * components should be included in query results. The entity may still be
   * excluded if one of it's components fail to pass the matchComponent filter.
   *
   * @param entity Subject entity
   * @param world World of query
   */
  matchEntity(entity: number, world: World): boolean

  /**
   * Filter by individual component. Return true if the associated entity's
   * components should be included in query results.
   *
   * @param component Subject entity's component
   * @param world World of query
   */
  matchComponent(component: Component, world: World): boolean
}

export function select<S extends Selector>(...selector: S): S {
  return selector
}

/**
 * Create a Query with a given set of component types.
 *
 * @param selector Component makeup of entities
 */
export function query<S extends Selector>(
  selector: S,
  ...filterConfig: (Filter | (() => Filter))[]
) {
  const queryLength = selector.length
  const queryLayout = selector.map(s => s.type)
  const filters = filterConfig.map(f => (typeof f === "function" ? f() : f))
  const filterLen = filters.length
  // Temporary array of components yielded by the query. This array is reused
  // for each resulting tuple, meaning it should not be stored by the consumer
  // between iterations (unless copied, i.e. results.slice()).
  const tmpResult = arrayOf(queryLength) as ComponentsOf<S>
  // Temporary array of integers where each index corresponds to the index of
  // the outgoing component (i.e. queryLayout index), and each value
  // corresponds to the index of that component in the archetype currently
  // being iterated. This lets us map the components to the correct index in
  // tmpResult.
  const tmpReadIndices: number[] = []

  let world: World
  let archetype: Archetype | null
  let archetypeIndex = -1
  let entityIndex = -1

  const result: IteratorResult<ComponentsOf<S>> = {
    value: tmpResult as ComponentsOf<S>,
    done: false,
  }

  function loadNextResult() {
    const { entities, table, indices } = archetype!

    while (true) {
      const entity = entities[++entityIndex]

      if (typeof entity !== "number") {
        goToNextArchetype()
        break
      }

      let match = true

      // Execute entity filters.
      for (let f = 0; f < filterLen; f++) {
        match = filters[f].matchEntity(entity, world)
        if (!match) break
      }

      if (!match) {
        continue
      }

      const tableEntityIndex = indices[entity]

      for (let k = 0; k < queryLength; k++) {
        const component = table[tmpReadIndices[k]][tableEntityIndex]!

        // Execute component filters.
        for (let f = 0; f < filterLen; f++) {
          match = filters[f].matchComponent(component, world)
          if (!match) break
        }

        if (!match) {
          continue
        }

        tmpResult[k] = component
      }

      if (match) {
        return
      }
    }
  }

  function goToNextArchetype() {
    const { archetypes } = world[$worldStorageKey]
    let visiting: Archetype

    while ((visiting = archetypes[++archetypeIndex])) {
      const { layout } = visiting

      archetype = visiting
      entityIndex = -1

      let match = true

      for (let i = 0; i < queryLength; i++) {
        const index = layout.indexOf(queryLayout[i])

        if (index === -1) {
          match = false
          break
        }

        tmpReadIndices[i] = index
      }

      if (!match) {
        continue
      }

      loadNextResult()
      return
    }

    result.done = true
    mutableEmpty(tmpResult)
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

  function resetState(_world: World) {
    world = _world
    archetype = null
    archetypeIndex = -1
    entityIndex = -1
  }

  function resetIterable() {
    result.value.length = 0
    result.done = false
  }

  return (world: World) => {
    resetState(world)
    resetIterable()

    return iterable
  }
}
