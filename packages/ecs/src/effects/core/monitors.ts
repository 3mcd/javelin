import { Archetype } from "../../archetype"
import { createEffect } from "../../effect"
import { Entity } from "../../entity"
import { Query, queryMatchesArchetype, Selector } from "../../query"
import { mutableEmpty } from "../../util"

type MonitorIteratee = (entity: Entity) => void
type MonitorPredicate = (
  query: Query,
  prev: Archetype,
  next: Archetype,
) => boolean

const createMonitor = (predicate: MonitorPredicate) =>
  createEffect(world => {
    const {
      storage: { entityRelocated },
    } = world
    let active: Query<any> | null = null
    let staged: number[] = []
    let ready: number[] = []

    const forEach = (iteratee: MonitorIteratee) => {
      for (let i = 0; i < ready.length; i++) {
        iteratee(ready[i])
      }
    }
    const api = {
      forEach,
      [Symbol.iterator]: () => ready[Symbol.iterator](),
    }

    const reset = (query: Query<any>) => {
      active = query
      mutableEmpty(staged)
      mutableEmpty(ready)
    }

    entityRelocated.subscribe((entity, prev, next) => {
      if (active === null || predicate(active, prev, next) === false) {
        return
      }
      staged.push(entity)
    })

    return function monitor<S extends Selector>(query: Query<S>) {
      let entity: number | undefined
      if (active !== query) {
        reset(query)
      }
      mutableEmpty(ready)
      while ((entity = staged.pop()) !== undefined) {
        ready.push(entity)
      }
      return api
    }
  })

/**
 * Get matching entities of a query that didn't match during the effect's
 * last execution.
 * @param query
 * @example <caption>Iterate with `forEach`</caption>
 * onInsert(bodies).forEach(entity => {
 *   // entity now matches the bodies query
 * })
 * @example <caption>Iterate with `for..of`</caption>
 * for (const entity of onInsert(bodies)) {
 *   // entity now matches the bodies query
 * }
 */
export const onInsert = createMonitor((query, prev, next) => {
  const matchPrev = queryMatchesArchetype(query, prev)
  const matchNext = queryMatchesArchetype(query, next)
  return !matchPrev && matchNext
})

/**
 * Get non-matching entities of a query that matched during the effect's
 * last execution.
 * @param query
 * @example <caption>Iterate with `forEach`</caption>
 * onRemove(bodies).forEach(entity => {
 *   // entity no longer matches the bodies query
 * })
 * @example <caption>Iterate with `for..of`</caption>
 * for (const entity of onRemove(bodies)) {
 *   // entity no longer matches the bodies query
 * }
 */
export const onRemove = createMonitor((query, prev, next) => {
  const matchPrev = queryMatchesArchetype(query, prev)
  const matchNext = queryMatchesArchetype(query, next)
  return matchPrev && !matchNext
})
