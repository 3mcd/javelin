import { Archetype, createArchetype } from "../../archetype"
import { Entity } from "../../entity"
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

const a = createQuery(A)
const ab = createQuery(A, B)
const c = createQuery(C)

const entitySortComparator = (a: Entity, b: Entity) => a - b

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

  it("emits entities that were added prior to the first execution", () => {
    const results: number[] = []
    const archetype = {
      ...createArchetype({ signature: [A[$componentType], B[$componentType]] }),
      entities: [2, 4, 6],
    }
    ;(world.storage.archetypes as Archetype[]).push(archetype)

    useMonitor(ab, e => results.push(e))

    expect(results.sort(entitySortComparator)).toEqual([2, 4, 6])
  })

  it("emits entities that were relocated last tick", () => {
    const resultsEnter: number[] = []
    const resultsExit: number[] = []
    const prev = createArchetype({ signature: [A[$componentType]] })
    const next = createArchetype({
      signature: [A[$componentType], B[$componentType]],
    })

    useMonitor(ab)

    world.storage.entityRelocated.dispatch(1, prev, next)
    world.storage.entityRelocated.dispatch(2, prev, next)
    world.storage.entityRelocated.dispatch(3, next, prev)

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

    useMonitor(ab)

    world.storage.entityRelocated.dispatch(1, prev, next)
    world.storage.entityRelocated.dispatch(2, prev, next)

    useMonitor(
      c,
      e => resultsEnter.push(e),
      e => resultsExit.push(e),
    )

    world.storage.entityRelocated.dispatch(3, prev, next)
    world.storage.entityRelocated.dispatch(4, prev, changed)

    useMonitor(
      c,
      e => resultsEnter.push(e),
      e => resultsExit.push(e),
    )

    expect(resultsEnter.sort(entitySortComparator)).toEqual([4])
  })
})
