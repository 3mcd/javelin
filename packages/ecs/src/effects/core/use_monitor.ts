import { createStackPool, mutableEmpty } from "@javelin/core"
import { Component } from "../../component"
import { createEffect } from "../../effect"
import { Entity, EntitySnapshotSparse } from "../../entity"
import {
  Query,
  Selector,
  SelectorResult,
  SelectorResultSparse,
} from "../../query"

type MonitorCallback<S extends Selector> = (
  entity: Entity,
  changed: SelectorResultSparse<S>,
) => unknown

const snapshots = createStackPool<EntitySnapshotSparse>(
  () => [-1, []],
  c => {
    c[0] = -1
    mutableEmpty(c[1])
    return c
  },
  1000,
)

/**
 * Detect when an entity begins matching or stops matching a query.
 *
 * The `onEnter` callback is executed when an entity begins matching the query,
 * while the `onExit` callback is executed when an entity no longer matches the
 * query. Either callback is executed with subject entity and a diff that
 * contains components that were either attached or detached to trigger the
 * transition.
 *
 * The diff of components is an array that matches the signature of a
 * query result. The value of the index of a component type which did not
 * change is null. The indices corresponding to components that did change hold
 * a reference to the component.
 *
 * Detached component references are already reset by the time the `onExit`
 * callback is invoked.
 *
 * @param query
 * @example
 * useMonitor(
 *   bodies,
 *   (e, results) => console.log(`${e} matches bodies`),
 *   (e, results) => console.log(`${e} no longer matches bodies`),
 * )
 *
 * @example
 * useMonitor(
 *   bodies,
 *   (e, [t]) => t && console.log(`transform was attached to ${e}`),
 *   (e, [t]) => t && console.log(`transform was detached from ${e}`),
 * )
 */
export const useMonitor = createEffect(world => {
  const {
    storage: {
      entityRelocated,
      archetypes: [rootArchetype],
    },
  } = world

  let stagedEnter: EntitySnapshotSparse[] = []
  let stagedExit: EntitySnapshotSparse[] = []
  let readyEnter: EntitySnapshotSparse[] = []
  let readyExit: EntitySnapshotSparse[] = []

  let _query: Query | null = null

  const register = (query: Query) => {
    _query = query

    mutableEmpty(stagedEnter)
    mutableEmpty(stagedExit)
    mutableEmpty(readyEnter)
    mutableEmpty(readyExit)

    for (const [entities] of query) {
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        const snapshot = snapshots.retain()
        snapshot[0] = entity
        query.get(entity, snapshot[1] as Component[])
        stagedEnter.push(snapshot)
      }
    }
  }

  entityRelocated.subscribe(function detectMonitorMatch(
    entity,
    prev,
    next,
    changed,
  ) {
    if (_query === null) {
      return
    }

    const matchEnter = _query.matchesArchetype(next)
    const matchExit = _query.matchesArchetype(prev)
    if (matchExit && next === rootArchetype) {
      // entity matched and unmatched during the same
      const index = stagedEnter.findIndex(([e]) => e === entity)
      if (index !== -1) {
        stagedEnter.splice(index, 1)
      }
    }

    if (
      // xor
      matchEnter !== matchExit
    ) {
      const snapshot = snapshots.retain()
      snapshot[0] = entity
      _query.match(changed, snapshot[1])
      ;(matchEnter ? stagedEnter : stagedExit).push(snapshot)
    }
  })

  return function useMonitor<S extends Selector>(
    query: Query<S>,
    onEnter?: MonitorCallback<S>,
    onExit?: MonitorCallback<S>,
  ) {
    if (_query !== query) {
      register(query)
    }

    let result: EntitySnapshotSparse | undefined

    mutableEmpty(readyEnter)
    mutableEmpty(readyExit)

    while ((result = stagedEnter.pop()) !== undefined) {
      readyEnter.push(result)
    }
    while ((result = stagedExit.pop()) !== undefined) {
      readyExit.push(result)
    }

    if (onEnter !== undefined) {
      for (let i = 0; i < readyEnter.length; i++) {
        const snapshot = readyEnter[i]
        onEnter(snapshot[0], snapshot[1] as SelectorResult<S>)
        snapshots.release(snapshot)
      }
    }

    if (onExit !== undefined) {
      for (let i = 0; i < readyExit.length; i++) {
        const snapshot = readyExit[i]
        onExit(snapshot[0], snapshot[1] as SelectorResult<S>)
        snapshots.release(snapshot)
      }
    }
  }
})
