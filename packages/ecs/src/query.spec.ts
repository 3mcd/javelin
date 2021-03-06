import { Archetype, createArchetype } from "./archetype"
import { Component } from "./component"
import { createComponentType } from "./helpers"
import { globals } from "./internal/globals"
import { query } from "./query"
import { createWorld } from "./world"

jest.mock("./archetype")
jest.mock("./world")

describe("query", () => {
  const A = createComponentType({ type: 0, schema: {} })
  const B = createComponentType({ type: 1, schema: {} })

  it("initializes with sorted signature", () => {
    const q = query(B, A)

    expect(q.signature).toEqual([0, 1])
  })
  it("queries collections of components", () => {
    const world = createWorld()
    const table = [
      [
        { _tid: 0, foo: 4 },
        { _tid: 0, foo: 5 },
        { _tid: 0, foo: 6 },
      ],
      [
        { _tid: 1, foo: 1 },
        { _tid: 1, foo: 2 },
        { _tid: 1, foo: 3 },
      ],
    ]

    ;(world.storage.archetypes as Archetype[]) = [
      {
        ...createArchetype({ signature: [0] }),
        signature: [0, 1],
        signatureInverse: [0, 1],
        entities: [1, 2, 0],
        indices: [2, 0, 1],
        table,
      } as Archetype,
    ]

    globals.__WORLDS__ = [world]
    globals.__CURRENT_WORLD__ = 0

    const q = query(A, B)

    let resultsA: Component[] = []
    let resultsB: Component[] = []

    q.forEach((e, [a, b]) => {
      resultsA.push(a)
      resultsB.push(b)
    })

    expect(resultsA).toContain(table[0][1])
    expect(resultsA).toContain(table[0][0])
    expect(resultsB).toContain(table[1][1])
    expect(resultsB).toContain(table[1][0])
  })
})
