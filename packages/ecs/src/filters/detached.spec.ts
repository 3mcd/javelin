import { createWorld, World } from "../world"
import { detached } from "./detached"
import { Component, ComponentState } from "../component"

jest.mock("../world")

describe("attached", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
  })

  it("matches newly detached components", () => {
    const A = {
      name: "A",
      type: 0,
      schema: {},
    }
    const filter = detached(A)
    const a1 = {
      tid: 0,
      cst: ComponentState.Detached,
    }
    const a2 = {
      tid: 0,
      cst: ComponentState.Attached,
    }
    const a3 = {
      tid: 0,
      cst: ComponentState.Attached,
    }

    expect(filter.componentPredicate(a1, world)).toBe(true)
    expect(filter.componentPredicate(a2, world)).toBe(false)
    expect(filter.componentPredicate(a3, world)).toBe(false)
  })
})
