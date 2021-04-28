import { Archetype, createArchetype } from "./archetype"
import { Component } from "./component"
import { $componentType, UNSAFE_internals } from "./internal"
import { createQuery } from "./query"
import { createWorld } from "./world"

jest.mock("./archetype")
jest.mock("./world")

describe("createQuery", () => {
  const A = { [$componentType]: 0 }
  const B = { [$componentType]: 1 }

  it("initializes with sorted signature", () => {
    const q = createQuery(B, A)

    expect(q.signature).toEqual([0, 1])
  })
  it("queries collections of components", () => {
    const world = createWorld()
    const table = [
      [
        { __type__: 0, foo: 4 },
        { __type__: 0, foo: 5 },
        { __type__: 0, foo: 6 },
      ],
      [
        { __type__: 1, foo: 1 },
        { __type__: 1, foo: 2 },
        { __type__: 1, foo: 3 },
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

    UNSAFE_internals.__WORLDS__ = [world]
    UNSAFE_internals.__CURRENT_WORLD__ = 0

    const q = createQuery(A, B)

    let resultsA: Component[] = []
    let resultsB: Component[] = []

    q((e, [a, b]) => {
      resultsA.push(a)
      resultsB.push(b)
    })

    expect(resultsA).toContain(table[0][1])
    expect(resultsA).toContain(table[0][0])
    expect(resultsB).toContain(table[1][1])
    expect(resultsB).toContain(table[1][0])
  })
})
