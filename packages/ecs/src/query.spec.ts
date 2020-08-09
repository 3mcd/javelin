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
        { _t: 1, _v: 1 },
        { _t: 1, _v: 2 },
        { _t: 1, _v: 3 },
      ],
      [
        { _t: 0, _v: 4 },
        { _t: 0, _v: 5 },
        { _t: 0, _v: 6 },
      ],
    ]

    ;(world as any)[$worldStorageKey].archetypes = [
      {
        ...createArchetype([0]),
        layout: [1, 0],
        entities: [1, 2, 0],
        entitiesByIndex: [2, 1, 0],
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
        { _t: 0, _v: 5 },
        { _t: 0, _v: 1 },
        { _t: 0, _v: 4 },
      ],
    ]
    const filter = (componentType: ComponentType): ComponentFilter => ({
      componentType,
      componentPredicate: (c: Component) => c._v === 1,
    })

    ;(world as any)[$worldStorageKey].archetypes = [
      {
        ...createArchetype([0]),
        layout: [0],
        entities: [0, 1, 2],
        entitiesByIndex: [0, 1, 2],
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
