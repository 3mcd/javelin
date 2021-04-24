import { mutableEmpty } from "@javelin/model"
import { createEffect } from "../../effect"
import { Entity } from "../../entity"
import { Query, queryMatchesArchetype, Selector } from "../../query"

type MonitorCallback = (entity: Entity) => unknown

/**
 * Detect when an entity begins matching, or no longer matches, a query.
 *
 * @param query
 * @example
 * effMonitor(
 *   bodies,
 *   e => console.log(`${e} matches bodies`),
 *   e => console.log(`${e} no longer matches bodies`),
 * )
 */
export const effMonitor = createEffect(world => {
  const {
    storage: { entityRelocated },
  } = world

  let stagedEnter: number[] = []
  let stagedExit: number[] = []
  let readyEnter: number[] = []
  let readyExit: number[] = []

  let _query: Query | null = null

  const register = (query: Query) => {
    _query = query

    mutableEmpty(stagedEnter)
    mutableEmpty(stagedExit)
    mutableEmpty(readyEnter)
    mutableEmpty(readyExit)

    for (const [entities] of query) {
      for (let i = 0; i < entities.length; i++) {
        stagedEnter.push(entities[i])
      }
    }
  }

  entityRelocated.subscribe((entity, prev, next) => {
    if (_query === null) {
      return
    }

    if (queryMatchesArchetype(_query, next)) {
      stagedEnter.push(entity)
    } else if (queryMatchesArchetype(_query, prev)) {
      stagedExit.push(entity)
    }
  })

  return function effMonitor<S extends Selector>(
    query: Query<S>,
    onEnter?: MonitorCallback,
    onExit?: MonitorCallback,
  ) {
    if (_query !== query) {
      register(query)
    }

    let entity: number | undefined

    mutableEmpty(readyEnter)
    mutableEmpty(readyExit)

    while ((entity = stagedEnter.pop()) !== undefined) {
      readyEnter.push(entity)
    }
    while ((entity = stagedExit.pop()) !== undefined) {
      readyExit.push(entity)
    }

    if (onEnter !== undefined) {
      for (let i = 0; i < readyEnter.length; i++) {
        onEnter(readyEnter[i])
      }
    }

    if (onExit !== undefined) {
      for (let i = 0; i < readyExit.length; i++) {
        onExit(readyExit[i])
      }
    }
  }
})
