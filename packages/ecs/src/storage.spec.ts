import { createArchetype } from "./archetype"
import { createStorage } from "./storage"

jest.mock("./archetype")

describe("createStorage", () => {
  it("creates a new archetype for each unique combination of components", () => {
    const storage = createStorage()

    storage.create(1, [{ __type__: 0 }])
    storage.create(2, [{ __type__: 1 }])
    storage.create(3, [{ __type__: 0 }, { __type__: 1 }])

    expect(createArchetype).toHaveBeenNthCalledWith(1, { signature: [0] })
    expect(createArchetype).toHaveBeenNthCalledWith(2, { signature: [1] })
    expect(createArchetype).toHaveBeenNthCalledWith(3, { signature: [0, 1] })
  })
  it("also removes entity from archetype when removed", () => {
    const storage = createStorage()
    const entity = storage.create(0, [{ __type__: 0 }])

    storage.destroy(entity)

    expect(storage.archetypes[0].remove).toHaveBeenCalledWith(entity)
  })
  it("moves entities into new archetypes when inserting components", () => {
    const storage = createStorage()
    const components = [{ __type__: 0 }]
    // The next archetype we create (via storage.create) will encompass the
    // first component.
    ;(createArchetype as jest.Mock).mockImplementation(() => ({
      insert: jest.fn(),
      remove: jest.fn(),
      signature: [0],
      table: [[components[0]]],
      indices: [0],
    }))
    const entity = storage.create(0, components)

    expect(storage.archetypes.length).toBe(1)
    expect(storage.archetypes[0].signature).toEqual([0])
    // The next archetype we create will encompass the second component.
    ;(createArchetype as jest.Mock).mockImplementation(() => ({
      insert: jest.fn(),
      signature: [0, 1],
      table: [[components[0]], []],
      indices: [0, 1],
    }))

    storage.insert(entity, [{ __type__: 1 }])

    expect(storage.archetypes[0].remove).toHaveBeenCalledWith(entity)
    expect(storage.archetypes.length).toBe(2)
    expect(storage.archetypes[1].signature).toEqual([0, 1])
  })

  afterEach(() => {
    ;(createArchetype as jest.Mock).mockClear()
  })
})
