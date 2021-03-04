import { Archetype, createArchetype } from "./archetype"
import { Component, ComponentType, ComponentState } from "./component"
import { ComponentFilter } from "./filter"
import { query } from "./query"
import { createWorld } from "./world"
import { createComponentType } from "./helpers"
import { globals } from "./internal/globals"

jest.mock("./archetype")
jest.mock("./world")

describe("query", () => {
  it("queries collections of components", () => {
    const A = createComponentType({ name: "A", type: 0, schema: {} })
    const B = createComponentType({ name: "B", type: 1, schema: {} })
    const world = createWorld()
    const table = [
      [
        { _tid: 1, _cst: ComponentState.Attached, foo: 1 },
        { _tid: 1, _cst: ComponentState.Attached, foo: 2 },
        { _tid: 1, _cst: ComponentState.Attached, foo: 3 },
      ],
      [
        { _tid: 0, _cst: ComponentState.Attached, foo: 4 },
        { _tid: 0, _cst: ComponentState.Attached, foo: 5 },
        { _tid: 0, _cst: ComponentState.Attached, foo: 6 },
      ],
    ]

    ;(world.storage.archetypes as Archetype[]) = [
      {
        ...createArchetype({ layout: [0] }),
        layout: [1, 0],
        layoutInverse: [1, 0],
        entities: [1, 2, 0],
        indices: [2, 0, 1],
        table,
      } as Archetype,
    ]

    globals.__WORLDS__ = [world]
    globals.__CURRENT_WORLD__ = 0

    const q = query(A, B)

    let resultsA = []
    let resultsB = []

    for (const [, a, b] of q) {
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
        { _tid: 0, _cst: ComponentState.Attached, foo: 5 },
        { _tid: 0, _cst: ComponentState.Attached, foo: 1 },
        { _tid: 0, _cst: ComponentState.Attached, foo: 4 },
      ],
    ]
    const filter = (componentType: ComponentType): ComponentFilter => ({
      componentType,
      componentPredicate: (c: Component) => c.foo === 1,
    })

    ;(world.storage.archetypes as Archetype[]) = [
      {
        ...createArchetype({ layout: [0] }),
        layout: [0],
        layoutInverse: [0],
        entities: [0, 1, 2],
        indices: [0, 1, 2],
        table,
      } as Archetype,
    ]

    globals.__WORLDS__ = [world]
    globals.__CURRENT_WORLD__ = 0

    const q = query(filter(A))

    for (const [e, a] of q) {
      expect(e).toBe(1)
      expect(a).toEqual(table[0][1])
    }
  })
})
