import { Archetype, createArchetype } from "../../archetype"
import { Component } from "../../component"
import { Entity } from "../../entity"
import { $componentType, UNSAFE_internals } from "../../internal"
import { createWorld, World } from "../../world"
import { effTrigger } from "./eff_trigger"

jest.mock("../../world")
jest.mock("../../effect")

const A = { [$componentType]: 1 }
const B = { [$componentType]: 2 }

const getComponentFromResults = (
  results: [Entity, Component][],
  entity: Entity,
) => results.find(([e]) => e === entity)![1]

describe("effAttach", () => {
  let world: World

  beforeEach(() => {
    world = createWorld()
    UNSAFE_internals.__CURRENT_WORLD__ = 1
    UNSAFE_internals.__WORLDS__ = [, world] as World[]
    ;(effTrigger as any).reset(world)
  })

  afterEach(() => {
    UNSAFE_internals.__CURRENT_WORLD__ = -1
    UNSAFE_internals.__WORLDS__ = []
  })

  it("yields components that were added prior to the first execution", () => {
    const results: [Entity, Component][] = []
    const archetype = {
      ...createArchetype({ signature: [A[$componentType]] }),
      entities: [2, 4, 6],
      table: [
        [
          { __type__: A[$componentType] },
          { __type__: A[$componentType] },
          { __type__: A[$componentType] },
        ],
      ],
    }
    const {
      entities: [e1, e2, e3],
      table: [[c1, c2, c3]],
    } = archetype
    ;(world.storage.archetypes as Archetype[]).push(archetype)

    effTrigger(A, (entity, a) => results.push([entity, a]))

    expect(getComponentFromResults(results, e1)).toBe(c1)
    expect(getComponentFromResults(results, e2)).toBe(c2)
    expect(getComponentFromResults(results, e3)).toBe(c3)
  })
  it("yields components that were attached t-1", () => {
    const inserts: [number, Component[]][] = [
      [1, [{ __type__: A[$componentType] }]],
      [2, [{ __type__: A[$componentType] }]],
      [3, [{ __type__: A[$componentType] }]],
    ]
    const [[e1, [c1]], [e2, [c2]], [e3, [c3]]] = inserts
    const results: [number, Component][] = []

    effTrigger(A)

    for (let i = 0; i < inserts.length; i++) {
      world.attached.dispatch(...inserts[i])
    }

    effTrigger(A, (e, a) => results.push([e, a]))

    expect(results.length).toBe(3)
    expect(getComponentFromResults(results, e1)).toBe(c1)
    expect(getComponentFromResults(results, e2)).toBe(c2)
    expect(getComponentFromResults(results, e3)).toBe(c3)
  })
  it("ignores components of different type", () => {
    let i = 0

    effTrigger(A)

    world.attached.dispatch(1, [{ __type__: A[$componentType] }])
    world.attached.dispatch(2, [{ __type__: B[$componentType] }])

    effTrigger(A, () => i++)

    world.attached.dispatch(3, [{ __type__: A[$componentType] }])
    world.attached.dispatch(4, [{ __type__: B[$componentType] }])

    effTrigger(A, () => i++)

    expect(i).toBe(2)
  })
  it("excludes components that were attached t-2", () => {
    let i = 0

    effTrigger(A)

    world.attached.dispatch(1, [{ __type__: A[$componentType] }])

    effTrigger(A)
    effTrigger(A, () => i++)

    expect(i).toBe(0)
  })
  it("supports swapping component type", () => {
    const results: Component[] = []

    effTrigger(A)

    world.attached.dispatch(1, [{ __type__: A[$componentType] }])

    effTrigger(B, (e, c) => results.push(c))

    world.attached.dispatch(2, [{ __type__: A[$componentType] }])
    world.attached.dispatch(3, [{ __type__: B[$componentType] }])

    effTrigger(B, (e, c) => results.push(c))

    expect(results.length).toBe(2)
  })
})
