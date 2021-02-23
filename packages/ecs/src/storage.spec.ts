import { createStorage } from "./storage"
import { createArchetype } from "./archetype"
import { ComponentState } from "./component"

jest.mock("./archetype")

describe("createStorage", () => {
  it("creates a new archetype for each unique combination of components", () => {
    const storage = createStorage()

    storage.create(1, [{ tid: 0, cst: ComponentState.Initialized }])
    storage.create(2, [{ tid: 1, cst: ComponentState.Initialized }])
    storage.create(3, [
      { tid: 0, cst: ComponentState.Initialized },
      { tid: 1, cst: ComponentState.Initialized },
    ])

    expect(createArchetype).toHaveBeenNthCalledWith(1, [0])
    expect(createArchetype).toHaveBeenNthCalledWith(2, [1])
    expect(createArchetype).toHaveBeenNthCalledWith(3, [0, 1])
  })
  it("also removes entity from archetype when removed", () => {
    const storage = createStorage()
    const entity = storage.create(0, [
      { tid: 0, cst: ComponentState.Initialized },
    ])

    storage.destroy(entity)

    expect(storage.archetypes[0].remove).toHaveBeenCalledWith(entity)
  })
  it("moves entities into new archetypes when inserting components", () => {
    const storage = createStorage()
    const components = [{ tid: 0, cst: ComponentState.Initialized }]
    // The next archetype we create (via storage.create) will encompass the
    // first component.
    ;(createArchetype as jest.Mock).mockImplementation(() => ({
      insert: jest.fn(),
      remove: jest.fn(),
      layout: [0],
      table: [[components[0]]],
      indices: [0],
    }))
    const entity = storage.create(0, components)

    expect(storage.archetypes.length).toBe(1)
    expect(storage.archetypes[0].layout).toEqual([0])
    // The next archetype we create will encompass the second component.
    ;(createArchetype as jest.Mock).mockImplementation(() => ({
      insert: jest.fn(),
      layout: [0, 1],
      table: [[components[0]], []],
      indices: [0, 1],
    }))

    storage.insert(entity, [{ tid: 1, cst: ComponentState.Initialized }])

    expect(storage.archetypes[0].remove).toHaveBeenCalledWith(entity)
    expect(storage.archetypes.length).toBe(2)
    expect(storage.archetypes[1].layout).toEqual([0, 1])
  })

  afterEach(() => {
    ;(createArchetype as jest.Mock).mockClear()
  })
})
