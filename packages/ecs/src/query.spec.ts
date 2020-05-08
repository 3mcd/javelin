import { createQuery } from "./query"
import { createStorage } from "./storage"
import { createArchetype, Archetype } from "./archetype"
import { Component } from "./component"

jest.mock("./archetype")
jest.mock("./storage")

describe("createQuery", () => {
  it("queries collections of components", () => {
    const A = { type: 0, schema: {} }
    const B = { type: 1, schema: {} }
    const storage = createStorage()
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

    ;(storage as any).archetypes = [
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

    for (const [a, b] of query.run(storage)) {
      resultsA.push(a)
      resultsB.push(b)
    }

    expect(resultsA[0]).toBe(table[1][1])
    expect(resultsA[1]).toBe(table[1][0])
    expect(resultsB[0]).toBe(table[0][1])
    expect(resultsB[1]).toBe(table[0][0])
  })
  it("supports filtering of entities and components", () => {
    const A = { type: 0, schema: {} }
    const storage = createStorage()
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

    ;(storage as any).archetypes = [
      {
        ...createArchetype([0]),
        layout: [0],
        entities: [0, 1, 2],
        indices: [0, 1, 2],
        table,
      } as Archetype,
    ]

    const query = createQuery(A)

    let results = []

    for (const [a] of query.run(storage, filter)) {
      results.push(a)
    }

    expect(results.length).toBe(1)
    expect(results[0]).toBe(table[0][1])
  })
})
