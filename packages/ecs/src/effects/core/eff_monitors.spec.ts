import { Archetype, createArchetype } from "../../archetype"
import { Entity } from "../../entity"
import { globals } from "../../internal/globals"
import { $type } from "../../internal/symbols"
import { createQuery } from "../../query"
import { createWorld, World } from "../../world"
import { effInsert, effRemove } from "./eff_monitors"

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

function runIncludeTest(
  monitor: typeof effInsert | typeof effRemove,
  world: World,
  insert = true,
  useForEach = true,
) {
  const results: number[] = []
  const prev = createArchetype({ signature: [A[$type]] })
  const next = createArchetype({ signature: [A[$type], B[$type]] })
  const left = insert ? prev : next
  const right = insert ? next : prev

  monitor(ab)

  world.storage.entityRelocated.dispatch(1, left, right)
  world.storage.entityRelocated.dispatch(2, left, right)
  world.storage.entityRelocated.dispatch(3, left, right)

  if (useForEach) {
    monitor(ab).forEach(entity => results.push(entity))
  } else {
    for (const entity of monitor(ab)) {
      results.push(entity)
    }
  }

  expect(results.sort(entitySortComparator)).toEqual([1, 2, 3])
}

function runExcludeTest(
  monitor: typeof effInsert | typeof effRemove,
  world: World,
  insert = true,
) {
  const results: number[] = []
  const root = createArchetype({ signature: [] })
  const prev = createArchetype({ signature: [A[$type]] })
  const next = createArchetype({ signature: [A[$type], B[$type]] })
  const left = insert ? prev : next
  const right = insert ? next : prev

  monitor(a)

  world.storage.entityRelocated.dispatch(1, left, right)
  world.storage.entityRelocated.dispatch(2, right, left)

  monitor(a).forEach(entity => results.push(entity))

  world.storage.entityRelocated.dispatch(
    3,
    insert ? root : left,
    insert ? left : root,
  )
  world.storage.entityRelocated.dispatch(
    4,
    insert ? root : left,
    insert ? right : root,
  )

  monitor(a).forEach(entity => results.push(entity))

  expect(results.length).toBe(2)
}

function runSwapTest(
  monitor: typeof effInsert | typeof effRemove,
  world: World,
  insert = true,
) {
  const results: number[] = []
  const prev = createArchetype({ signature: [A[$type]] })
  const next = createArchetype({ signature: [A[$type], B[$type]] })
  const changed = createArchetype({ signature: [C[$type]] })
  const left = insert ? prev : next
  const right = insert ? next : prev

  monitor(ab)

  world.storage.entityRelocated.dispatch(1, left, right)
  world.storage.entityRelocated.dispatch(2, left, right)

  monitor(c).forEach(entity => results.push(entity))

  world.storage.entityRelocated.dispatch(3, left, right)
  world.storage.entityRelocated.dispatch(
    4,
    insert ? prev : changed,
    insert ? changed : prev,
  )

  monitor(c).forEach(entity => results.push(entity))

  expect(results.sort(entitySortComparator)).toEqual([4])
}

describe("effInsert", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    globals.__CURRENT_WORLD__ = 1
    globals.__WORLDS__ = [, world] as World[]
    ;(effInsert as any).reset(world)
  })

  afterEach(() => {
    globals.__CURRENT_WORLD__ = -1
    globals.__WORLDS__ = []
  })

  it("yields entities that were added prior to the first execution", () => {
    const results: number[] = []
    const archetype = {
      ...createArchetype({ signature: [A[$type], B[$type]] }),
      entities: [2, 4, 6],
    }
    ;(world.storage.archetypes as Archetype[]).push(archetype)

    effInsert(ab).forEach(entity => results.push(entity))

    expect(results.sort(entitySortComparator)).toEqual([2, 4, 6])
  })

  it("yields entities that were relocated last tick and now match query", () => {
    runIncludeTest(effInsert, world)
  })

  it("supports [Symbol.iterator]", () => {
    runIncludeTest(effInsert, world, true, true)
  })

  it("excludes entities that already match query", () => {
    runExcludeTest(effInsert, world)
  })

  it("clears buffer and subscribes to new component type when swapped", () => {
    runSwapTest(effInsert, world)
  })
})

describe("effRemove", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    ;(effRemove as any).reset(world)
  })

  it("yields entities that were relocated last tick and no longer match query", () => {
    runIncludeTest(effRemove, world, false)
  })

  it("supports [Symbol.iterator]", () => {
    runIncludeTest(effRemove, world, false, true)
  })

  it("excludes entities that already match query", () => {
    runExcludeTest(effRemove, world, false)
  })

  it("clears buffer and subscribes to new component type when swapped", () => {
    runSwapTest(effRemove, world, false)
  })
})
