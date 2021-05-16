import { ArchetypeSnapshot, createArchetype } from "./archetype"

describe("createArchetype", () => {
  const flags = {
    A: 1,
    B: 2,
    C: 4,
  }
  it("initializes a component table from provided component signature", () => {
    const archetype = createArchetype({ signature: [1, 2, 3] })

    expect(archetype.table.length).toBe(3)
    expect(archetype.table[0]).toBeInstanceOf(Array)
    expect(archetype.table[1]).toBeInstanceOf(Array)
    expect(archetype.table[2]).toBeInstanceOf(Array)
  })
  it("initializes with sorted type signature", () => {
    const archetype = createArchetype({ signature: [1, 18, 2, 10] })

    expect(archetype.signature).toEqual([1, 2, 10, 18])
  })
  it("adds entity to entities array when inserted", () => {
    const entity = 0
    const archetype = createArchetype({ signature: [1] })

    archetype.insert(entity, [{ __type__: 1 }])

    expect(archetype.entities.indexOf(entity)).toBe(0)
  })
  it("assigns entities an index when inserted", () => {
    const entity1 = 0
    const entity2 = 1
    const archetype = createArchetype({ signature: [1, 4] })

    archetype.insert(entity1, [{ __type__: 1 }, { __type__: 4 }])
    archetype.insert(entity2, [{ __type__: 1 }, { __type__: 4 }])

    expect(archetype.indices[entity1]).toBe(0)
    expect(archetype.indices[entity2]).toBe(1)
  })
  it("updates the component table with inserted components", () => {
    const entity = 0
    const archetype = createArchetype({ signature: [1, 4] })
    const components = [{ __type__: 1 }, { __type__: 4 }]

    archetype.insert(entity, components)

    const index = archetype.indices[entity]

    expect(archetype.table[0][index]).toBe(components[0])
    expect(archetype.table[1][index]).toBe(components[1])
  })
  it("removes entity from entities array when removed", () => {
    const entity = 0
    const archetype = createArchetype({ signature: [1] })

    archetype.insert(entity, [{ __type__: 1 }])
    archetype.remove(entity)

    expect(archetype.entities.indexOf(entity)).toBe(-1)
  })
  it("unsets an entity's index when removed and replaces it with the head", () => {
    const entity1 = 0
    const entity2 = 1
    const archetype = createArchetype({ signature: [1, 4] })

    archetype.insert(entity1, [{ __type__: 1 }, { __type__: 4 }])
    archetype.insert(entity2, [{ __type__: 1 }, { __type__: 4 }])

    const index = archetype.indices[entity1]
    archetype.remove(entity1)

    expect(archetype.indices[entity1]).toBe(undefined)
    expect(archetype.indices[entity2]).toBe(index)
  })
  it("swaps an entity's components with the head when removed", () => {
    const entity1 = 0
    const entity2 = 1
    const archetype = createArchetype({ signature: [1, 4] })
    const components = [{ __type__: 1 }, { __type__: 4 }]

    archetype.insert(entity1, [{ __type__: 1 }, { __type__: 4 }])
    archetype.insert(entity2, components)

    const index = archetype.indices[entity1]

    archetype.remove(entity1)

    expect(archetype.table[0][index]).toBe(components[0])
    expect(archetype.table[1][index]).toBe(components[1])
  })
  it("restores from snapshot", () => {
    const snapshot: ArchetypeSnapshot = {
      signature: [1, 2, 3],
      table: [
        [{ __type__: 1 }, { __type__: 1 }, { __type__: 1 }],
        [{ __type__: 2 }, { __type__: 2 }, { __type__: 2 }],
        [{ __type__: 3 }, { __type__: 3 }, { __type__: 3 }],
      ],
      indices: {
        3: 0,
        7: 1,
        10: 2,
      },
    }
    const archetype = createArchetype({ snapshot })

    expect(archetype.signature).toEqual([1, 2, 3])
    expect(archetype.entities.slice().sort((a, b) => a - b)).toEqual([3, 7, 10])
    expect(archetype.indices).toEqual([, , , 0, , , , 1, , , 2])
  })
})
