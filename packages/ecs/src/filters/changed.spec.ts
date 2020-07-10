import { createWorld, World } from "../world"
import { changed } from "./changed"

jest.mock("../world")

describe("changed", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
  })

  it("always matches entities", () => {
    const filter = changed()
    const entity = 1

    expect(filter.matchEntity(entity, world)).toBe(true)
  })
  it("matches only changed components", () => {
    const filter = changed()
    const component = {
      _t: 0,
      _e: 0,
      _v: 0,
    }

    expect(filter.matchComponent(component, world)).toBe(true)
    expect(filter.matchComponent(component, world)).toBe(false)
    component._v = 1
    expect(filter.matchComponent(component, world)).toBe(true)
    expect(filter.matchComponent(component, world)).toBe(false)
  })
})
