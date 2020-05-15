import { createWorld, World } from "../world"
import { createTagFilter } from "./tag"

jest.mock("../world")

describe("createTagFilter", () => {
  let world: World

  beforeEach(() => {
    world = createWorld([])
  })

  it("matches entities tagged with the provided bit flag", () => {
    const filter = createTagFilter(2)

    world.hasTag = jest.fn((e, t) => e === 0 && t === 2)

    expect(filter.matchEntity(0, world)).toBe(true)
    expect(filter.matchEntity(0, world)).toBe(true)

    world.hasTag = jest.fn((e, t) => false)

    expect(filter.matchEntity(0, world)).toBe(false)
  })
  it("always matches components", () => {
    const filter = createTagFilter(2)
    const component = { _t: 0, _e: 0, _v: 0 }

    expect(filter.matchComponent(component, world)).toBe(true)
  })
})
