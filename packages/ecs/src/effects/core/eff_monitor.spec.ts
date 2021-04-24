import { Archetype, createArchetype } from "../../archetype"
import { Entity } from "../../entity"
import { globals } from "../../internal/globals"
import { $type } from "../../internal/symbols"
import { createQuery } from "../../query"
import { createWorld, World } from "../../world"
import { effMonitor } from "./eff_monitor"

jest.mock("../../archetype")
jest.mock("../../effect")
jest.mock("../../world")

const A = { [$type]: 1 }
const B = { [$type]: 2 }
const C = { [$type]: 3 }

const a = createQuery(A)
const ab = createQuery(A, B)
const c = createQuery(C)

const entitySortComparator = (a: Entity, b: Entity) => a - b

describe("effMonitor", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    globals.__CURRENT_WORLD__ = 1
    globals.__WORLDS__ = [, world] as World[]
    ;(effMonitor as any).reset(world)
  })

  afterEach(() => {
    globals.__CURRENT_WORLD__ = -1
    globals.__WORLDS__ = []
  })

  it("emits entities that were added prior to the first execution", () => {
    const results: number[] = []
    const archetype = {
      ...createArchetype({ signature: [A[$type], B[$type]] }),
      entities: [2, 4, 6],
    }
    ;(world.storage.archetypes as Archetype[]).push(archetype)

    effMonitor(ab, e => results.push(e))

    expect(results.sort(entitySortComparator)).toEqual([2, 4, 6])
  })

  it("emits entities that were relocated last tick", () => {
    const resultsEnter: number[] = []
    const resultsExit: number[] = []
    const prev = createArchetype({ signature: [A[$type]] })
    const next = createArchetype({ signature: [A[$type], B[$type]] })

    effMonitor(ab)

    world.storage.entityRelocated.dispatch(1, prev, next)
    world.storage.entityRelocated.dispatch(2, prev, next)
    world.storage.entityRelocated.dispatch(3, next, prev)

    effMonitor(
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
    const prev = createArchetype({ signature: [A[$type]] })
    const next = createArchetype({ signature: [A[$type], B[$type]] })
    const changed = createArchetype({ signature: [C[$type]] })

    effMonitor(ab)

    world.storage.entityRelocated.dispatch(1, prev, next)
    world.storage.entityRelocated.dispatch(2, prev, next)

    effMonitor(
      c,
      e => resultsEnter.push(e),
      e => resultsExit.push(e),
    )

    world.storage.entityRelocated.dispatch(3, prev, next)
    world.storage.entityRelocated.dispatch(4, prev, changed)

    effMonitor(
      c,
      e => resultsEnter.push(e),
      e => resultsExit.push(e),
    )

    expect(resultsEnter.sort(entitySortComparator)).toEqual([4])
  })
})
