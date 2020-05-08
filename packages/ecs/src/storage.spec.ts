import { createStorage } from "./storage"
import { createArchetype } from "./archetype"

jest.mock("./archetype")

describe("createStorage", () => {
  it("returns a new entity for each call to create", () => {
    const storage = createStorage()
    const entityA = storage.create([{ _t: 0, _e: -1, _v: 0 }])
    const entityB = storage.create([{ _t: 0, _e: -1, _v: 0 }])

    expect(entityA).toBe(0)
    expect(entityB).toBe(1)
  })
  it("updates inserted components' _e properties", () => {
    const storage = createStorage()
    const component = { _t: 0, _e: -1, _v: 0 }
    const entity = storage.create([component])

    expect(component._e).toBe(entity)
  })
  it("creates a new archetype for each unique combination of components", () => {
    const storage = createStorage()

    storage.create([{ _t: 0, _e: -1, _v: 0 }])
    storage.create([{ _t: 1, _e: -1, _v: 0 }])
    storage.create([
      { _t: 0, _e: -1, _v: 0 },
      { _t: 1, _e: -1, _v: 0 },
    ])

    expect(createArchetype).toHaveBeenNthCalledWith(1, [0])
    expect(createArchetype).toHaveBeenNthCalledWith(2, [1])
    expect(createArchetype).toHaveBeenNthCalledWith(3, [0, 1])
  })
  it("also removes entity from archetype when removed", () => {
    const storage = createStorage()
    const entity = storage.create([{ _t: 0, _e: -1, _v: 0 }])

    storage.destroy(entity)

    expect(storage.archetypes[0].remove).toHaveBeenCalledWith(entity)
  })
  it("moves entities into new archetypes when inserting components", () => {
    const storage = createStorage()
    const components = [{ _t: 0, _e: -1, _v: 0 }]
    // The next archetype we create (via storage.create) will encompass the
    // first component.
    ;(createArchetype as jest.Mock).mockImplementation(() => ({
      insert: jest.fn(),
      remove: jest.fn(),
      layout: [0],
      table: [[components[0]]],
      indices: [0],
    }))
    const entity = storage.create(components)

    expect(storage.archetypes.length).toBe(1)
    expect(storage.archetypes[0].layout).toEqual([0])
    // The next archetype we create will encompass the second component.
    ;(createArchetype as jest.Mock).mockImplementation(() => ({
      insert: jest.fn(),
      layout: [0, 1],
      table: [[components[0]], []],
      indices: [0, 1],
    }))

    storage.insert(entity, { _t: 1, _e: -1, _v: 0 })

    expect(storage.archetypes[0].remove).toHaveBeenCalledWith(entity)
    expect(storage.archetypes.length).toBe(2)
    expect(storage.archetypes[1].layout).toEqual([0, 1])
  })

  afterEach(() => {
    ;(createArchetype as jest.Mock).mockClear()
  })
})
