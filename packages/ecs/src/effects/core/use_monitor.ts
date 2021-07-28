import {
  assert,
  createStackPool,
  mutableEmpty,
  mutableRemoveByIndexUnordered,
} from "@javelin/core"
import { Component } from "../../component"
import { createEffect } from "../../effect"
import { Entity, EntitySnapshotWithDiff } from "../../entity"
import {
  Query,
  Selector,
  SelectorResult,
  SelectorResultSparse,
} from "../../query"

type MonitorCallback<$Selector extends Selector> = (
  entity: Entity,
  results: SelectorResult<$Selector>,
  diff: SelectorResultSparse<$Selector>,
) => unknown

const snapshots = createStackPool<EntitySnapshotWithDiff>(
  () => [-1, [], []],
  c => {
    c[0] = -1
    mutableEmpty(c[1])
    mutableEmpty(c[2])
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
      entityRelocating,
      entityRelocated,
      archetypes: [rootArchetype],
    },
  } = world

  const matched = new Set<Entity>()
  let stagedEnter: EntitySnapshotWithDiff[] = []
  let stagedExit: EntitySnapshotWithDiff[] = []
  let readyEnter: EntitySnapshotWithDiff[] = []
  let readyExit: EntitySnapshotWithDiff[] = []

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
        query.get(entity, snapshot[1])
        query.get(entity, snapshot[2] as Component[])
        stagedEnter.push(snapshot)
      }
    }
  }

  entityRelocating.subscribe(function detectMonitorExit(
    entity,
    prev,
    next,
    diff,
  ) {
    if (_query === null) return
    const matchCurr = matched.has(entity)
    const matchPrev = _query.matchesType(prev.type)
    const matchNext = _query.matchesType(next.type)
    const isExit = matchPrev && (!matchNext || next === rootArchetype)
    if (!isExit) return
    if (matchCurr) {
      const index = stagedEnter.findIndex(([e]) => e === entity)
      assert(index !== -1)
      mutableRemoveByIndexUnordered(stagedEnter, index)
      return
    }
    const snapshot = snapshots.retain()
    snapshot[0] = entity
    _query.get(entity, snapshot[1])
    _query.match(diff, snapshot[2])
    stagedExit.push(snapshot)
  })

  entityRelocated.subscribe(function detectMonitorEnter(
    entity,
    prev,
    next,
    diff,
  ) {
    if (_query === null) return
    const matchPrev = _query.matchesType(prev.type)
    const matchNext = _query.matchesType(next.type)
    if (!matchPrev && matchNext) {
      const snapshot = snapshots.retain()
      snapshot[0] = entity
      _query.get(entity, snapshot[1])
      _query.match(diff, snapshot[2])
      stagedEnter.push(snapshot)
      matched.add(entity)
    }
  })

  return function useMonitor<$Selector extends Selector>(
    query: Query<$Selector>,
    onEnter?: MonitorCallback<$Selector>,
    onExit?: MonitorCallback<$Selector>,
  ) {
    if (_query !== query && !_query?.equals(query)) {
      register(query)
    }

    let result: EntitySnapshotWithDiff | undefined

    mutableEmpty(readyEnter)
    mutableEmpty(readyExit)

    while ((result = stagedEnter.pop()) !== undefined) {
      readyEnter.push(result)
    }
    while ((result = stagedExit.pop()) !== undefined) {
      readyExit.push(result)
    }

    matched.clear()

    if (onEnter !== undefined) {
      for (let i = 0; i < readyEnter.length; i++) {
        const snapshot = readyEnter[i]
        onEnter(
          snapshot[0],
          snapshot[1] as SelectorResult<$Selector>,
          snapshot[2] as SelectorResultSparse<$Selector>,
        )
        snapshots.release(snapshot)
      }
    }

    if (onExit !== undefined) {
      for (let i = 0; i < readyExit.length; i++) {
        const snapshot = readyExit[i]
        onExit(
          snapshot[0],
          snapshot[1] as SelectorResult<$Selector>,
          snapshot[2] as SelectorResultSparse<$Selector>,
        )
        snapshots.release(snapshot)
      }
    }
  }
})
