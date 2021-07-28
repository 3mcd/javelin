import { createArchetype } from "./archetype"
import { $type } from "./component"
import { createStorage } from "./storage"

jest.mock("./archetype")

describe("createStorage", () => {
  it("creates a new archetype for each unique combination of components", () => {
    const storage = createStorage()

    ;(createArchetype as jest.Mock).mockClear()

    storage.attachComponents(1, [{ [$type]: 0 }])
    storage.attachComponents(2, [{ [$type]: 1 }])
    storage.attachComponents(3, [{ [$type]: 0 }, { [$type]: 1 }])

    expect(createArchetype).toHaveBeenNthCalledWith(1, { type: [0] })
    expect(createArchetype).toHaveBeenNthCalledWith(2, { type: [1] })
    expect(createArchetype).toHaveBeenNthCalledWith(3, { type: [0, 1] })
  })
  it("also removes entity from archetype when removed", () => {
    const storage = createStorage()
    storage.attachComponents(0, [{ [$type]: 0 }])
    const archetype = storage.archetypes[1]

    ;(archetype as any).entities = [0]
    ;(archetype as any).indices = [0]
    ;(archetype as any).table = [[{ [$type]: 0 }]]

    storage.clearComponents(0)

    expect(archetype.remove).toHaveBeenCalledWith(0)
  })
  it("moves entities into new archetypes when inserting components", () => {
    const storage = createStorage()
    const components = [{ [$type]: 0 }]
    // The next archetype we create (via storage.insert) will encompass the
    // first component.
    ;(createArchetype as jest.Mock).mockClear()
    ;(createArchetype as jest.Mock).mockImplementation(() => ({
      insert: jest.fn(),
      remove: jest.fn(),
      type: [0],
      table: [[components[0]]],
      indices: [0],
    }))
    storage.attachComponents(0, components)

    expect(storage.archetypes.length).toBe(2)
    expect(storage.archetypes[1].type).toEqual([0])
    // The next archetype we create will encompass the second component.
    ;(createArchetype as jest.Mock).mockImplementation(() => ({
      insert: jest.fn(),
      type: [0, 1],
      table: [[components[0]], []],
      indices: [0, 1],
    }))

    storage.attachComponents(0, [{ [$type]: 1 }])

    expect(storage.archetypes[1].remove).toHaveBeenCalledWith(0)
    expect(storage.archetypes.length).toBe(3)
    expect(storage.archetypes[2].type).toEqual([0, 1])
  })

  afterEach(() => {
    ;(createArchetype as jest.Mock).mockClear()
  })
})
