import { createStorage } from "./storage"
import { createArchetype } from "./archetype"
import { ComponentState } from "./component"

jest.mock("./archetype")

describe("createStorage", () => {
  it("creates a new archetype for each unique combination of components", () => {
    const storage = createStorage()

    storage.create(1, [{ _tid: 0, _cst: ComponentState.Attached }])
    storage.create(2, [{ _tid: 1, _cst: ComponentState.Attached }])
    storage.create(3, [
      { _tid: 0, _cst: ComponentState.Attached },
      { _tid: 1, _cst: ComponentState.Attached },
    ])

    expect(createArchetype).toHaveBeenNthCalledWith(1, { layout: [0] })
    expect(createArchetype).toHaveBeenNthCalledWith(2, { layout: [1] })
    expect(createArchetype).toHaveBeenNthCalledWith(3, { layout: [0, 1] })
  })
  it("also removes entity from archetype when removed", () => {
    const storage = createStorage()
    const entity = storage.create(0, [
      { _tid: 0, _cst: ComponentState.Attached },
    ])

    storage.destroy(entity)

    expect(storage.archetypes[0].remove).toHaveBeenCalledWith(entity)
  })
  it("moves entities into new archetypes when inserting components", () => {
    const storage = createStorage()
    const components = [{ _tid: 0, _cst: ComponentState.Attached }]
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

    storage.insert(entity, [{ _tid: 1, _cst: ComponentState.Attached }])

    expect(storage.archetypes[0].remove).toHaveBeenCalledWith(entity)
    expect(storage.archetypes.length).toBe(2)
    expect(storage.archetypes[1].layout).toEqual([0, 1])
  })

  afterEach(() => {
    ;(createArchetype as jest.Mock).mockClear()
  })
})
