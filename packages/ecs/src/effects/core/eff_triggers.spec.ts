import { Archetype, createArchetype } from "../../archetype"
import { Component } from "../../component"
import { Entity } from "../../entity"
import { createComponentType } from "../../helpers"
import { Signal } from "../../signal"
import { createWorld, World } from "../../world"
import { effAttach, effDetach } from "./eff_triggers"

jest.mock("../../world")
jest.mock("../../effect")

type Trigger = typeof effAttach | typeof effDetach
type ComponentsSignal = Signal<Entity, ReadonlyArray<Component>>

const A = createComponentType({ type: 1 })
const B = createComponentType({ type: 2 })

const getComponentFromResults = (
  results: [Entity, Component][],
  entity: Entity,
) => results.find(([e]) => e === entity)![1]

function runIncludeTest(
  trigger: Trigger,
  signal: ComponentsSignal,
  useForEach = true,
) {
  const inserts: [number, Component[]][] = [
    [1, [{ _tid: A.type }]],
    [2, [{ _tid: A.type }]],
    [3, [{ _tid: A.type }]],
  ]
  const [[e1, [c1]], [e2, [c2]], [e3, [c3]]] = inserts
  const results: [number, Component][] = []

  trigger(A)

  for (let i = 0; i < inserts.length; i++) {
    signal.dispatch(...inserts[i])
  }

  if (useForEach) {
    trigger(A).forEach((e, a) => results.push([e, a]))
  } else {
    for (const [e, a] of trigger(A)) {
      results.push([e, a])
    }
  }

  expect(results.length).toBe(3)
  expect(getComponentFromResults(results, e1)).toBe(c1)
  expect(getComponentFromResults(results, e2)).toBe(c2)
  expect(getComponentFromResults(results, e3)).toBe(c3)
}

function runExcludeTest(trigger: Trigger, signal: ComponentsSignal) {
  let i = 0

  trigger(A)

  signal.dispatch(1, [{ _tid: A.type }])
  signal.dispatch(2, [{ _tid: B.type }])

  trigger(A).forEach(() => i++)

  signal.dispatch(3, [{ _tid: A.type }])
  signal.dispatch(4, [{ _tid: B.type }])

  trigger(A).forEach(() => i++)

  expect(i).toBe(2)
}

function runFlushTest(trigger: Trigger, signal: ComponentsSignal) {
  let i = 0

  trigger(A)

  signal.dispatch(1, [{ _tid: A.type }])

  trigger(A)
  trigger(A).forEach(() => i++)

  expect(i).toBe(0)
}

function runSwitchTest(trigger: Trigger, signal: ComponentsSignal) {
  const results: Component[] = []

  trigger(A)

  signal.dispatch(1, [{ _tid: A.type }])

  trigger(B).forEach((e, c) => results.push(c))

  signal.dispatch(2, [{ _tid: A.type }])
  signal.dispatch(3, [{ _tid: B.type }])

  trigger(B).forEach((e, c) => results.push(c))

  expect(results.length).toBe(2)
}

describe("effAttach", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    ;(effAttach as any).reset(world)
  })
  it("yields components that were added prior to the first execution", () => {
    const results: [Entity, Component][] = []
    const archetype = {
      ...createArchetype({ signature: [A.type] }),
      entities: [2, 4, 6],
      table: [[{ _tid: A.type }, { _tid: A.type }, { _tid: A.type }]],
    }
    const {
      entities: [e1, e2, e3],
      table: [[c1, c2, c3]],
    } = archetype
    ;(world.storage.archetypes as Archetype[]).push(archetype)

    effAttach(A).forEach((entity, a) => results.push([entity, a]))

    expect(getComponentFromResults(results, e1)).toBe(c1)
    expect(getComponentFromResults(results, e2)).toBe(c2)
    expect(getComponentFromResults(results, e3)).toBe(c3)
  })
  it("yields components that were attached t-1", () => {
    runIncludeTest(effAttach, world.attached)
  })
  it("supports [Symbol.iterator]", () => {
    runIncludeTest(effAttach, world.attached, false)
  })
  it("ignores components of different type", () => {
    runExcludeTest(effAttach, world.attached)
  })
  it("excludes components that were attached t-2", () => {
    runFlushTest(effAttach, world.attached)
  })
  it("supports switching component type", () => {
    runSwitchTest(effAttach, world.attached)
  })
})

describe("effDetach", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    ;(effDetach as any).reset(world)
  })
  it("yields components that were detached t-1", () => {
    runIncludeTest(effDetach, world.detached)
  })
  it("supports [Symbol.iterator]", () => {
    runIncludeTest(effDetach, world.detached, false)
  })
  it("ignores components of different type", () => {
    runExcludeTest(effDetach, world.detached)
  })
  it("excludes components that were detached t-2", () => {
    runFlushTest(effDetach, world.detached)
  })
  it("supports switching component type", () => {
    runSwitchTest(effDetach, world.detached)
  })
})
