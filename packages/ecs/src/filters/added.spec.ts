import { createStorage, Storage } from "../storage"
import { createAddedFilter } from "./added"

jest.mock("../storage")

describe("createAddedFilter", () => {
  let storage: Storage

  beforeEach(() => {
    storage = createStorage()
  })

  it("always matches entities", () => {
    const filter = createAddedFilter()
    const entity = 1

    expect(filter.matchEntity(entity, storage)).toBe(true)
  })
  it("matches only filtered components", () => {
    const filter = createAddedFilter()
    const component = {
      _t: 0,
      _e: 0,
      _v: 0,
    }

    expect(filter.matchComponent(component, storage)).toBe(true)
    expect(filter.matchComponent(component, storage)).toBe(false)
    expect(filter.matchComponent(component, storage)).toBe(false)
  })
})
