import { Archetype, createArchetype } from "./archetype"
import { Component, ComponentType } from "./component"
import { ComponentFilter } from "./filter"
import { query } from "./query"
import { $worldStorageKey } from "./symbols"
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
      [
        { type: 1, foo: 1 },
        { type: 1, foo: 2 },
        { type: 1, foo: 3 },
      ],
      [
        { type: 0, foo: 4 },
        { type: 0, foo: 5 },
        { type: 0, foo: 6 },
      ],
    ]

    ;(world as any)[$worldStorageKey].archetypes = [
      {
        ...createArchetype([0]),
        layout: [1, 0],
        entities: [1, 2, 0],
        indices: [2, 1, 0],
        table,
      } as Archetype,
    ]

    const q = query(A, B)

    let resultsA = []
    let resultsB = []

    for (const [, [a, b]] of q(world)) {
      resultsA.push(a)
      resultsB.push(b)
    }

    expect(resultsA).toContain(table[1][1])
    expect(resultsA).toContain(table[1][0])
    expect(resultsB).toContain(table[0][1])
    expect(resultsB).toContain(table[0][0])
  })
  it("supports filtering of entities and components", () => {
    const A = createComponentType({ name: "A", type: 0, schema: {} })
    const world = createWorld()
    const table = [
      [
        { type: 0, foo: 5 },
        { type: 0, foo: 1 },
        { type: 0, foo: 4 },
      ],
    ]
    const filter = (componentType: ComponentType): ComponentFilter => ({
      componentType,
      componentPredicate: (c: Component) => c.foo === 1,
    })

    ;(world as any)[$worldStorageKey].archetypes = [
      {
        ...createArchetype([0]),
        layout: [0],
        entities: [0, 1, 2],
        indices: [0, 1, 2],
        table,
      } as Archetype,
    ]

    const q = query(filter(A))

    for (const [entity, [a]] of q(world)) {
      expect(entity).toBe(1)
      expect(a).toEqual(table[0][1])
    }
  })
})
