import { EntitySnapshotSparse } from "@javelin/ecs"
import { Archetype, createArchetype } from "../../archetype"
import { Entity, EntitySnapshot } from "../../entity"
import { $componentType, UNSAFE_internals } from "../../internal"
import { createQuery } from "../../query"
import { createWorld, World } from "../../world"
import { useMonitor } from "./use_monitor"

jest.mock("../../archetype")
jest.mock("../../effect")
jest.mock("../../world")

const A = { [$componentType]: 1 }
const B = { [$componentType]: 2 }
const C = { [$componentType]: 3 }

const ab = createQuery(A, B)
const c = createQuery(C)

const entitySortComparator = (a: Entity, b: Entity) => a - b
const entitySnapshotSortComparitor = (
  [ea]: EntitySnapshot | EntitySnapshotSparse,
  [eb]: EntitySnapshot | EntitySnapshotSparse,
) => entitySortComparator(ea, eb)

describe("useMonitor", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    UNSAFE_internals.__CURRENT_WORLD__ = 1
    UNSAFE_internals.__WORLDS__ = [, world] as World[]
    ;(useMonitor as any).reset(world)
  })

  afterEach(() => {
    UNSAFE_internals.__CURRENT_WORLD__ = -1
    UNSAFE_internals.__WORLDS__ = []
  })

  it("emits entity-component pairs that were added prior to the first execution", () => {
    const results: EntitySnapshotSparse[] = []
    const archetype = {
      ...createArchetype({ signature: [A[$componentType], B[$componentType]] }),
      entities: [2, 4, 6],
    }
    ;(world.storage.archetypes as Archetype[]).push(archetype)
    archetype.table = [
      [{ __type__: 1 }, { __type__: 2 }],
      [{ __type__: 1 }, { __type__: 2 }],
      [{ __type__: 1 }, { __type__: 2 }],
    ]
    archetype.indices = [-1, -1, 0, -1, 1, -1, 2]

    useMonitor(ab, (e, components) => results.push([e, components]))

    results.sort(entitySnapshotSortComparitor)

    expect(results[0][0]).toBe(2)
    expect(results[1][0]).toBe(4)
    expect(results[2][0]).toBe(6)
  })

  it.todo("emits entity-component pairs")

  it("emits entities that were relocated last tick", () => {
    const resultsEnter: number[] = []
    const resultsExit: number[] = []
    const prev = createArchetype({ signature: [A[$componentType]] })
    const next = createArchetype({
      signature: [A[$componentType], B[$componentType]],
    })
    ;(world.storage.archetypes as Archetype[]).push(prev)
    ;(world.storage.archetypes as Archetype[]).push(next)
    ;(next as any).table = [
      [{ __type__: 1 }, { __type__: 2 }],
      [{ __type__: 1 }, { __type__: 2 }],
      [{ __type__: 1 }, { __type__: 2 }],
    ]
    ;(next as any).indices = [-1, 0, 1, 2]

    useMonitor(ab)

    world.storage.entityRelocated.dispatch(1, prev, next, [])
    world.storage.entityRelocated.dispatch(2, prev, next, [])
    world.storage.entityRelocated.dispatch(3, next, prev, [])

    useMonitor(
      ab,
      e => resultsEnter.push(e),
      e => resultsExit.push(e),
    )
    expect(resultsEnter.sort(entitySortComparator)).toEqual([1, 2])
    expect(resultsExit.sort(entitySortComparator)).toEqual([3])
  })

  it("clears buffer and subscribes to new component type when swapped", () => {
    const resultsEnter: number[] = []
    const resultsExit: number[] = []
    const prev = createArchetype({ signature: [A[$componentType]] })
    const next = createArchetype({
      signature: [A[$componentType], B[$componentType]],
    })
    const changed = createArchetype({ signature: [C[$componentType]] })
    ;(world.storage.archetypes as Archetype[]).push(changed)
    ;(changed as any).table = [[{ __type__: 1 }, { __type__: 2 }]]
    ;(changed as any).indices = [-1, -1, -1, -1, 0]

    useMonitor(ab)

    world.storage.entityRelocated.dispatch(1, prev, next, [])
    world.storage.entityRelocated.dispatch(2, prev, next, [])

    useMonitor(
      c,
      e => resultsEnter.push(e),
      e => resultsExit.push(e),
    )

    world.storage.entityRelocated.dispatch(3, prev, next, [])
    world.storage.entityRelocated.dispatch(4, prev, changed, [])

    useMonitor(
      c,
      e => resultsEnter.push(e),
      e => resultsExit.push(e),
    )

    expect(resultsEnter.sort(entitySortComparator)).toEqual([4])
  })
})
