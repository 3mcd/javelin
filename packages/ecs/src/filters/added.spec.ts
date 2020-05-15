import { createWorld, World } from "../world"
import { createAddedFilter } from "./added"

jest.mock("../world")

describe("createAddedFilter", () => {
  let world: World

  beforeEach(() => {
    world = createWorld([])
  })

  it("matches only added entities", () => {
    const filter = createAddedFilter()
    const entity = 1

    ;(world.created as Set<number>).add(entity)

    expect(filter.matchEntity(entity, world)).toBe(true)
  })
  it("always matches components", () => {
    const filter = createAddedFilter()
    const component = {
      _t: 0,
      _e: 0,
      _v: 0,
    }

    expect(filter.matchComponent(component, world)).toBe(true)
  })
})
