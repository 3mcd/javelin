import { Archetype } from "./archetype"
import { ComponentsOf, ComponentType, Component } from "./component"
import { Storage } from "./storage"
import { arrayOf } from "./util/array"
import { World } from "./world"

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

/**
 * A Query is executed against a Storage to yield tuples of components that
 * match the provided component makeup and pass any provided filters.
 */
export interface QueryLike<T extends ComponentType[]> {
  /**
   * Execute the query against a Storage. Optionally executed with filters to
   * further refine the results.
   *
   * @param world Storage instance
   * @param filters Zero or more filters
   */
  run(world: World): IterableIterator<ComponentsOf<T>>

  filter(filter: Filter): QueryLike<T>
}

/**
 * Create a Query with a given set of component types.
 *
 * @param componentTypes Component makeup of entities
 */
export function createQuery<T extends ComponentType[]>(
  ...componentTypes: T
): QueryLike<T> {
  const len = componentTypes.length
  const queryLayout = componentTypes.map(s => s.type)
  // Temporary array of components yielded by the query. This array is reused
  // for each resulting tuple, meaning it should not be stored by the consumer
  // between iterations (unless copied, i.e. results.slice()).
  const tmpResult = arrayOf(componentTypes.length) as ComponentsOf<T>
  // Temporary array of integers where each index corresponds to the index of
  // the outgoing component (i.e. queryLayout index), and each value
  // corresponds to the index of that component in the archetype currently
  // being iterated. This lets us map the components to the correct index in
  // tmpResult.
  const tmpReadIndices: number[] = []
  const filters: Filter[] = []

  function filter(f: Filter) {
    if (filters.indexOf(f) > -1) {
      return query
    }
    filters.push(f)
    return query
  }

  function* run(world: World) {
    const { archetypes } = world.storage
    const filterLen = filters.length

    if (queryLayout.length === 0) {
      return
    }

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]
      const { layout, entities, indices, table } = archetype
      const entitiesLength = entities.length

      // Only consider archetypes that include the provided component types.
      let match = true

      for (let j = 0; j < len; j++) {
        if (layout.indexOf(queryLayout[j]) === -1) {
          match = false
          break
        }
      }

      if (!match) {
        continue
      }

      // The consumer expects the yielded tuples of components to be in the
      // same order as the query, so we calculate the index of each outgoing
      // component.
      for (let k = 0; k < len; k++) {
        tmpReadIndices[k] = (archetype as Archetype).layout.indexOf(
          queryLayout[k],
        )
      }

      for (let j = 0; j < entitiesLength; j++) {
        const entity = entities[j]
        const index = indices[entity]

        // Execute entity filters.
        match = true

        for (let f = 0; f < filterLen; f++) {
          match = filters[f].matchEntity(entity, world)
          if (!match) break
        }

        if (!match) continue

        for (let k = 0; k < len; k++) {
          const component = table[tmpReadIndices[k]][index]!

          // Execute component filters.
          for (let f = 0; f < filterLen; f++) {
            match = filters[f].matchComponent(component, world)
            if (!match) break
          }

          if (!match) break

          tmpResult[k] = component
        }

        // Yield result if the entity and its components pass the filter.
        if (match) {
          yield tmpResult
        }
      }
    }
  }

  const query = { run, filter }

  return query
}
