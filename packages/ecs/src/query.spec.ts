import { createQuery } from "./query"
import { createWorld } from "./world"
import { createArchetype, Archetype } from "./archetype"
import { Component } from "./component"

jest.mock("./archetype")
jest.mock("./world")

describe("createQuery", () => {
  it("queries collections of components", () => {
    const A = { name: "A", type: 0, schema: {} }
    const B = { name: "B", type: 1, schema: {} }
    const world = createWorld()
    const table = [
      [
        { _t: 1, _e: 2, _v: 0 },
        { _t: 1, _e: 1, _v: 0 },
        { _t: 1, _e: 0, _v: 0 },
      ],
      [
        { _t: 0, _e: 2, _v: 0 },
        { _t: 0, _e: 1, _v: 0 },
        { _t: 0, _e: 0, _v: 0 },
      ],
    ]

    ;(world as any).storage.archetypes = [
      {
        ...createArchetype([0]),
        layout: [1, 0],
        entities: [1, 2, 0],
        indices: [2, 1, 0],
        table,
      } as Archetype,
    ]

    const query = createQuery(A, B)

    let resultsA = []
    let resultsB = []

    for (const [a, b] of query.run(world)) {
      resultsA.push(a)
      resultsB.push(b)
    }

    expect(resultsA[0]).toBe(table[1][1])
    expect(resultsA[1]).toBe(table[1][0])
    expect(resultsB[0]).toBe(table[0][1])
    expect(resultsB[1]).toBe(table[0][0])
  })
  it("supports filtering of entities and components", () => {
    const A = { name: "A", type: 0, schema: {} }
    const world = createWorld()
    const table = [
      [
        { _t: 0, _e: 2, _v: 0 },
        { _t: 0, _e: 1, _v: 1 },
        { _t: 0, _e: 0, _v: 0 },
      ],
    ]
    const filter = {
      matchEntity(entity: number) {
        return entity === 1
      },
      matchComponent(component: Component) {
        return component._v === 1
      },
    }

    ;(world as any).storage.archetypes = [
      {
        ...createArchetype([0]),
        layout: [0],
        entities: [0, 1, 2],
        indices: [0, 1, 2],
        table,
      } as Archetype,
    ]

    const query = createQuery(A).filter(filter)

    let results = []

    for (const [a] of query.run(world)) {
      results.push(a)
    }

    expect(results.length).toBe(1)
    expect(results[0]).toBe(table[0][1])
  })
})
