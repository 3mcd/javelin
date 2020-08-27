import { createWorld, World } from "../world"
import { detached } from "./detached"
import { Component } from "../component"

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
      type: 0,
    }
    const a2 = {
      type: 0,
    }
    const a3 = {
      type: 0,
    }

    ;(world.detached as Set<Component>).add(a1)

    expect(filter.componentPredicate(a1, world)).toBe(true)
    expect(filter.componentPredicate(a2, world)).toBe(false)
    expect(filter.componentPredicate(a3, world)).toBe(false)
  })
})
