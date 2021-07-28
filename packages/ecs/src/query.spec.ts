import { Archetype, createArchetype } from "./archetype"
import { $type, Component, registerSchema } from "./component"
import { UNSAFE_internals } from "./internal"
import { createQuery } from "./query"
import { createWorld, World } from "./world"

jest.mock("./archetype")
jest.mock("./world")

describe("createQuery", () => {
  const A = {}
  const B = {}

  registerSchema(A, 0)
  registerSchema(B, 1)

  it("queries collections of components", () => {
    const world = createWorld()
    const table = [
      [
        { [$type]: 0, foo: 4 },
        { [$type]: 0, foo: 5 },
        { [$type]: 0, foo: 6 },
      ],
      [
        { [$type]: 1, foo: 1 },
        { [$type]: 1, foo: 2 },
        { [$type]: 1, foo: 3 },
      ],
    ]

    ;(world.storage.archetypes as Archetype[]) = [
      {
        ...createArchetype({ type: [0] }),
        type: [0, 1],
        typeInverse: [0, 1],
        entities: [1, 2, 0],
        indices: [2, 0, 1],
        table,
      } as Archetype,
    ]
    ;(UNSAFE_internals as { worlds: World[] }).worlds = [world]
    UNSAFE_internals.currentWorldId = 0

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
