import { createArchetype } from "./archetype"

describe("createArchetype", () => {
  it("initializes a component table from provided component layout", () => {
    const layout = [1, 2, 3]
    const archetype = createArchetype([1, 2, 3])

    expect(archetype.layoutSize).toBe(3)
    expect(archetype.indexByType.every((x, i) => x === layout[i]))
  })
  it("adds entity to entities array when inserted", () => {
    const entity = 0
    const archetype = createArchetype([1])

    archetype.insert(entity, [{ type: 1 }])

    expect(archetype.entities.indexOf(entity)).toBe(0)
  })
  it("assigns entities an index when inserted", () => {
    const entity1 = 0
    const entity2 = 1
    const archetype = createArchetype([1, 4])

    archetype.insert(entity1, [{ type: 1 }, { type: 4 }])
    archetype.insert(entity2, [{ type: 1 }, { type: 4 }])

    expect(archetype.entities[0]).toBe(entity1)
    expect(archetype.entities[1]).toBe(entity2)
  })
  it("updates the component table with inserted components", () => {
    const entity = 0
    const archetype = createArchetype([1, 4])
    const components = [{ type: 1 }, { type: 4 }]

    archetype.insert(entity, components)

    const index = archetype.entities.indexOf(entity)

    expect(
      archetype.table[index + archetype.indexByType[components[0].type]],
    ).toBe(components[0])
    expect(
      archetype.table[index + archetype.indexByType[components[1].type]],
    ).toBe(components[1])
    expect(
      archetype.get(entity)[archetype.indexByType[components[0].type]],
    ).toBe(components[0])
    expect(
      archetype.get(entity)[archetype.indexByType[components[1].type]],
    ).toBe(components[1])
    expect(archetype.getByType(entity, components[0].type)).toBe(components[0])
    expect(archetype.getByType(entity, components[1].type)).toBe(components[1])
  })
  it("removes entity from entities array when removed", () => {
    const entity = 0
    const archetype = createArchetype([1])

    archetype.insert(entity, [{ type: 1 }])
    archetype.remove(entity)

    expect(archetype.entities.indexOf(entity)).toBe(-1)
  })
  it("unsets an entity's index when removed and replaces it with the head", () => {
    const entity1 = 0
    const entity2 = 1
    const archetype = createArchetype([1, 4])

    archetype.insert(entity1, [{ type: 1 }, { type: 4 }])
    archetype.insert(entity2, [{ type: 1 }, { type: 4 }])

    const index = archetype.entities.indexOf(entity1)

    archetype.remove(entity1)

    expect(archetype.entities.indexOf(entity1)).toBe(-1)
    expect(archetype.entities.indexOf(entity2)).toBe(index)
  })
  it("swaps an entity's components with the head when removed", () => {
    const entity1 = 0
    const entity2 = 1
    const archetype = createArchetype([1, 4])
    const components = [{ type: 1 }, { type: 4 }]

    archetype.insert(entity1, [{ type: 1 }, { type: 4 }])
    archetype.insert(entity2, components)

    const index = archetype.entities.indexOf(entity1)

    archetype.remove(entity1)

    expect(
      archetype.table[index + archetype.indexByType[components[0].type]],
    ).toBe(components[0])
    expect(
      archetype.table[index + archetype.indexByType[components[1].type]],
    ).toBe(components[1])
  })
})
