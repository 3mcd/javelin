import { Archetype, createArchetype } from "./archetype"
import { Component, ComponentType } from "./component"
import { ComponentFilter } from "./filter"
import { query } from "./query"
import { createWorld } from "./world"
import { createComponentType } from "./helpers"

jest.mock("./archetype")
jest.mock("./world")

describe("query", () => {
  it("queries collections of components", () => {
    const A = createComponentType({ name: "A", type: 0, schema: {} })
    const B = createComponentType({ name: "B", type: 1, schema: {} })
    const world = createWorld()
    const table = [
      { type: 1, foo: 1 },
      { type: 0, foo: 1 },
      { type: 1, foo: 2 },
      { type: 0, foo: 2 },
      { type: 1, foo: 3 },
      { type: 0, foo: 3 },
    ]

    ;(world.storage as any).archetypes = [
      {
        ...createArchetype([1, 0]),
        entities: [0, 1, 2],
        layout: [1, 0],
        layoutSize: 2,
        table,
      } as Archetype,
    ]

    const q = query(A, B)

    let i = 0

    for (const [entity, [a, b]] of q(world)) {
      expect(entity).toBe(i)
      expect(a).toBe(table[i * 2 + 1])
      expect(b).toBe(table[i * 2])
      i++
    }
  })
  it("supports filtering of entities and components", () => {
    const A = createComponentType({ name: "A", type: 0, schema: {} })
    const world = createWorld()
    const table = [
      { type: 0, foo: 5 },
      { type: 0, foo: 1 },
      { type: 0, foo: 4 },
    ]
    const filter = (componentType: ComponentType): ComponentFilter => ({
      componentType,
      componentPredicate: (c: Component) => c.foo === 1,
    })

    ;(world.storage as any).archetypes = [
      {
        ...createArchetype([0]),
        layout: [0],
        layoutSize: 1,
        entities: [0, 1, 2],
        table,
      } as Archetype,
    ]

    const q = query(filter(A))

    for (const [entity, [a]] of q(world)) {
      expect(entity).toBe(1)
      expect(a).toEqual(table[1])
    }
  })
})
