import { createStorage, Storage } from "../storage"
import { createChangedFilter } from "./changed"

jest.mock("../storage")

describe("createChangedFilter", () => {
  let storage: Storage

  beforeEach(() => {
    storage = createStorage()
  })

  it("always matches entities", () => {
    const filter = createChangedFilter()
    const entity = 1

    expect(filter.matchEntity(entity, storage)).toBe(true)
  })
  it("matches only changed components", () => {
    const filter = createChangedFilter()
    const component = {
      _t: 0,
      _e: 0,
      _v: 0,
    }

    expect(filter.matchComponent(component, storage)).toBe(true)
    expect(filter.matchComponent(component, storage)).toBe(false)
    component._v = 1
    expect(filter.matchComponent(component, storage)).toBe(true)
    expect(filter.matchComponent(component, storage)).toBe(false)
  })
})
