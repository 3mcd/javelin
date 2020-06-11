import { createWorld, World } from "../world"
import { created } from "./created"

jest.mock("../world")

describe("created", () => {
  let world: World

  beforeEach(() => {
    world = createWorld([])
  })

  it("matches only created entities", () => {
    const filter = created()
    const entity = 1

    ;(world.created as Set<number>).add(entity)

    expect(filter.matchEntity(entity, world)).toBe(true)
  })
  it("always matches components", () => {
    const filter = created()
    const component = {
      _t: 0,
      _e: 0,
      _v: 0,
    }

    expect(filter.matchComponent(component, world)).toBe(true)
  })
})
