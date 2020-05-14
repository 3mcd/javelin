import { createWorld, World } from "../world"
import { createAddedFilter } from "./added"

jest.mock("../world")

describe("createAddedFilter", () => {
  let world: World

  beforeEach(() => {
    world = createWorld([])
  })

  it("always matches entities", () => {
    const filter = createAddedFilter()
    const entity = 1

    expect(filter.matchEntity(entity, world)).toBe(true)
  })
  it("matches only filtered components", () => {
    const filter = createAddedFilter()
    const component = {
      _t: 0,
      _e: 0,
      _v: 0,
    }

    expect(filter.matchComponent(component, world)).toBe(true)
    expect(filter.matchComponent(component, world)).toBe(false)
    expect(filter.matchComponent(component, world)).toBe(false)
  })
})
