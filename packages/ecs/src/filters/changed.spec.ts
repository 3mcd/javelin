import { createWorld, World } from "../world"
import { changed } from "./changed"

jest.mock("../world")

describe("changed", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
  })

  it("matches only changed components", () => {
    const A = {
      name: "A",
      type: 0,
      schema: {},
    }
    const filter = changed(A)
    const component = {
      _t: 0,
      _v: 0,
    }

    expect(filter.componentPredicate(component, world)).toBe(true)
    expect(filter.componentPredicate(component, world)).toBe(false)
    component._v = 1
    expect(filter.componentPredicate(component, world)).toBe(true)
    expect(filter.componentPredicate(component, world)).toBe(false)
  })
})
