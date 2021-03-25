import { Archetype, createArchetype } from "../../archetype"
import { Entity } from "../../entity"
import { createComponentType } from "../../helpers"
import { globals } from "../../internal/globals"
import { query } from "../../query"
import { createWorld, World } from "../../world"
import { onInsert, onRemove } from "./monitors"

jest.mock("../../archetype")
jest.mock("../../effect")
jest.mock("../../world")

const A = createComponentType({ type: 1 })
const B = createComponentType({ type: 2 })
const C = createComponentType({ type: 3 })

const a = query(A)
const ab = query(A, B)
const c = query(C)

const entitySortComparator = (a: Entity, b: Entity) => a - b

function runIncludeTest(
  monitor: typeof onInsert | typeof onRemove,
  world: World,
  insert = true,
  useForEach = true,
) {
  const results: number[] = []
  const prev = createArchetype({ signature: [A.type] })
  const next = createArchetype({ signature: [A.type, B.type] })
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
  monitor: typeof onInsert | typeof onRemove,
  world: World,
  insert = true,
) {
  const results: number[] = []
  const root = createArchetype({ signature: [] })
  const prev = createArchetype({ signature: [A.type] })
  const next = createArchetype({ signature: [A.type, B.type] })
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
  monitor: typeof onInsert | typeof onRemove,
  world: World,
  insert = true,
) {
  const results: number[] = []
  const prev = createArchetype({ signature: [A.type] })
  const next = createArchetype({ signature: [A.type, B.type] })
  const changed = createArchetype({ signature: [C.type] })
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

describe("onInsert", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    globals.__CURRENT_WORLD__ = 1
    globals.__WORLDS__ = [, world] as World[]
    ;(onInsert as any).reset(world)
  })

  afterEach(() => {
    globals.__CURRENT_WORLD__ = -1
    globals.__WORLDS__ = []
  })

  it("yields entities that were added prior to the first execution", () => {
    const results: number[] = []
    const archetype = {
      ...createArchetype({ signature: [A.type, B.type] }),
      entities: [2, 4, 6],
    }
    ;(world.storage.archetypes as Archetype[]).push(archetype)

    onInsert(ab).forEach(entity => results.push(entity))

    expect(results.sort(entitySortComparator)).toEqual([2, 4, 6])
  })

  it("yields entities that were relocated last tick and now match query", () => {
    runIncludeTest(onInsert, world)
  })

  it("supports [Symbol.iterator]", () => {
    runIncludeTest(onInsert, world, true, true)
  })

  it("excludes entities that already match query", () => {
    runExcludeTest(onInsert, world)
  })

  it("clears buffer and subscribes to new component type when swapped", () => {
    runSwapTest(onInsert, world)
  })
})

describe("onRemove", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    ;(onRemove as any).reset(world)
  })

  it("yields entities that were relocated last tick and no longer match query", () => {
    runIncludeTest(onRemove, world, false)
  })

  it("supports [Symbol.iterator]", () => {
    runIncludeTest(onRemove, world, false, true)
  })

  it("excludes entities that already match query", () => {
    runExcludeTest(onRemove, world, false)
  })

  it("clears buffer and subscribes to new component type when swapped", () => {
    runSwapTest(onRemove, world, false)
  })
})
