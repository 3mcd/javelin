import { createWorld, World } from "../world"
import { attached } from "./attached"
import { Component } from "../../dist/cjs/component"
import { ComponentState } from "@javelin/ecs"

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
      _tid: 0,
      _cst: ComponentState.Attaching,
    }
    const a2 = {
      _tid: 0,
      _cst: ComponentState.Attached,
    }

    expect(filter.componentPredicate(a1, world)).toBe(true)
    expect(filter.componentPredicate(a2, world)).toBe(false)
  })
})
