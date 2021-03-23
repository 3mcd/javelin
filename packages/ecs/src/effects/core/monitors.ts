import { Archetype } from "../../archetype"
import { createEffect } from "../../effect"
import { Entity } from "../../entity"
import { Query, queryMatchesArchetype, Selector } from "../../query"
import { Signal } from "../../signal"
import { mutableEmpty } from "../../util"

type MonitorIteratee = (entity: Entity) => void

const createMonitor = (
  signalSelector: (archetype: Archetype) => Signal<number>,
) =>
  createEffect(world => {
    const { storage } = world
    const unsubscribers: (() => void)[] = []

    let q: Query<any> | null = null
    let ready: number[] = []
    let staged: number[] = []
    const forEach = (iteratee: MonitorIteratee) => {
      for (let i = 0; i < ready.length; i++) {
        iteratee(ready[i])
      }
    }
    const api = {
      forEach,
      [Symbol.iterator]: ready[Symbol.iterator],
    }

    const reset = (query: Query<any>) => {
      let unsubscribe: (() => void) | undefined
      while ((unsubscribe = unsubscribers.pop())) {
        unsubscribe()
      }
      q = query
      mutableEmpty(staged)
      mutableEmpty(ready)
      storage.archetypes.forEach(maybeRegisterArchetype)
    }

    const maybeRegisterArchetype = (archetype: Archetype) => {
      if (q === null) {
        return
      }
      if (queryMatchesArchetype(q, archetype)) {
        const signal = signalSelector(archetype)
        const unsubscribe = signal.subscribe(entity => staged.push(entity))
        unsubscribers.push(unsubscribe)
      }
    }

    storage.archetypeCreated.subscribe(maybeRegisterArchetype)

    return function monitor<S extends Selector>(query: Query<S>) {
      let entity: number | undefined
      if (q !== query) {
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
 * Get matching entities of a query that didn't match during the previous
 * execution.
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
export const onInsert = createMonitor(archetype => archetype.inserted)

/**
 * Get non-matching entities of a query that matched during the previous
 * execution.
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
export const onRemove = createMonitor(archetype => archetype.removed)
