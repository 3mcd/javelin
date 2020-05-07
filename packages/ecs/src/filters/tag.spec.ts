import { createStorage, Storage } from "../storage"
import { createTagFilter } from "./tag"

jest.mock("../storage")

describe("createTagFilter", () => {
  let storage: Storage

  beforeEach(() => {
    storage = createStorage()
  })

  it("matches entities tagged with the provided bit flag", () => {
    const filter = createTagFilter(2)

    storage.hasTag = jest.fn((e, t) => e === 0 && t === 2)

    expect(filter.matchEntity(0, storage)).toBe(true)
    expect(filter.matchEntity(0, storage)).toBe(true)

    storage.hasTag = jest.fn((e, t) => false)

    expect(filter.matchEntity(0, storage)).toBe(false)
  })
  it("always matches components", () => {
    const filter = createTagFilter(2)
    const component = { _t: 0, _e: 0, _v: 0 }

    expect(filter.matchComponent(component, storage)).toBe(true)
  })
})
