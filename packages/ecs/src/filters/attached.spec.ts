import { createWorld, World } from "../world"
import { attached } from "./attached"
import { Component } from "../../dist/cjs/component"

jest.mock("../world")

describe("attached", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
  })

  it("matches newly attached components", () => {
    const A = {
      name: "A",
      type: 0,
      schema: {},
    }
    const filter = attached(A)
    const a1 = {
      type: 0,
      state: 0,
    }
    const a2 = {
      type: 0,
      state: 0,
    }

    ;(world.attached as Set<Component>).add(a1)

    expect(filter.componentPredicate(a1, world)).toBe(true)
    expect(filter.componentPredicate(a2, world)).toBe(false)
  })
})
