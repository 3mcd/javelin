import { createWorld, World } from "../world"
import { detached } from "./detached"

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
      _t: 0,
      _v: -1,
    }
    const a2 = {
      _t: 0,
      _v: 0,
    }
    const a3 = {
      _t: 0,
      _v: 1,
    }

    expect(filter.componentPredicate(a1, world)).toBe(true)
    expect(filter.componentPredicate(a2, world)).toBe(false)
    expect(filter.componentPredicate(a3, world)).toBe(false)
  })
})
