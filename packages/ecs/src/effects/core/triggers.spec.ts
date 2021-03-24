import { Component } from "../../component"
import { Entity } from "../../entity"
import { createComponentType } from "../../helpers"
import { Signal } from "../../signal"
import { createWorld, World } from "../../world"
import { onAttach, onDetach } from "./triggers"

jest.mock("../../world")
jest.mock("../../effect")

type Trigger = typeof onAttach | typeof onDetach
type ComponentsSignal = Signal<Entity, ReadonlyArray<Component>>

const A = createComponentType({ type: 1 })
const B = createComponentType({ type: 2 })

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
  const getComponent = (entity: number) =>
    results.find(([e]) => e === entity)![1]

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
  expect(getComponent(e1)).toBe(c1)
  expect(getComponent(e2)).toBe(c2)
  expect(getComponent(e3)).toBe(c3)
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

describe("onAttach", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    ;(onAttach as any).reset(world)
  })
  it("yields components that were attached t-1", () => {
    runIncludeTest(onAttach, world.attached)
  })
  it("supports [Symbol.iterator]", () => {
    runIncludeTest(onAttach, world.attached, false)
  })
  it("ignores components of different type", () => {
    runExcludeTest(onAttach, world.attached)
  })
  it("excludes components that were attached t-2", () => {
    runFlushTest(onAttach, world.attached)
  })
  it("supports switching component type", () => {
    runSwitchTest(onAttach, world.attached)
  })
})

describe("onDetach", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    ;(onDetach as any).reset(world)
  })
  it("yields components that were detached t-1", () => {
    runIncludeTest(onDetach, world.detached)
  })
  it("supports [Symbol.iterator]", () => {
    runIncludeTest(onDetach, world.detached, false)
  })
  it("ignores components of different type", () => {
    runExcludeTest(onDetach, world.detached)
  })
  it("excludes components that were detached t-2", () => {
    runFlushTest(onDetach, world.detached)
  })
  it("supports switching component type", () => {
    runSwitchTest(onDetach, world.detached)
  })
})
