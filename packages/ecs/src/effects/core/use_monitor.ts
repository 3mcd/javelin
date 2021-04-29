import { mutableEmpty } from "@javelin/model"
import { Component, componentTypePools } from "../../component"
import { createEffect } from "../../effect"
import { Entity } from "../../entity"
import { createStackPool } from "../../pool"
import {
  Query,
  queryMatchesArchetype,
  Selector,
  SelectorResult,
} from "../../query"

type OnEnterCallback<S extends Selector> = (
  entity: Entity,
  components: SelectorResult<S>,
) => unknown
type OnExitCallback<S extends Selector> = (entity: Entity) => unknown

const componentsPool = createStackPool(
  () => [] as Component[],
  c => {
    mutableEmpty(c)
    return c
  },
  1000,
)

/**
 * Detect when an entity begins matching, or no longer matches, a query.
 *
 * @param query
 * @example
 * useMonitor(
 *   bodies,
 *   e => console.log(`${e} matches bodies`),
 *   e => console.log(`${e} no longer matches bodies`),
 * )
 */
export const useMonitor = createEffect(world => {
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

  const tmpComponents: SelectorResult<Selector> = []

  return function useMonitor<S extends Selector>(
    query: Query<S>,
    onEnter?: OnEnterCallback<S>,
    onExit?: OnExitCallback<S>,
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
        const entity = readyEnter[i]
        if (query.get(entity, tmpComponents as SelectorResult<S>)) {
          onEnter(readyEnter[i], tmpComponents as SelectorResult<S>)
        }
      }
    }

    if (onExit !== undefined) {
      for (let i = 0; i < readyExit.length; i++) {
        onExit(readyExit[i])
      }
    }
  }
})
