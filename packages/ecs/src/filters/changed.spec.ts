import { createWorld, World } from "../world"
import { changed } from "./changed"
import { ComponentState } from "@javelin/ecs"

jest.mock("../world")

describe("changed", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
  })

  it("matches only changed components", () => {
    const A = {
      type: 0,
      schema: {},
    }
    const filter = changed(A)
    const component = {
      _tid: 0,
      _cst: ComponentState.Attached,
    }

    ;(world.isComponentChanged as jest.Mock).mockReturnValue(true)
    expect(filter.componentPredicate(component, world)).toBe(true)
    ;(world.isComponentChanged as jest.Mock).mockReturnValue(false)
    expect(filter.componentPredicate(component, world)).toBe(false)
  })
})
