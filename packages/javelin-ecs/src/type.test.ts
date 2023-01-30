import {expect, suite, test} from "vitest"
import {makeType, makeTagType, Not, NormalizedType} from "./type.js"

let [a, b, c] = Array.from({length: 3}, makeTagType)

suite("Type", () => {
  test("normalized type memoization", () => {
    let T = makeType(b, c, a)
    expect(T.normalized).toBe(NormalizedType.fromComponents(T.components))
  })
  test("type memoization", () => {
    let type = makeType(b, c, a)
    expect(type).toBe(makeType(b, c, a))
  })
  test("type included components", () => {
    let T = makeType(b, c, a)
    let components = [b, c, a].map(type => type.components[0])
    expect(T.components).toEqual([components[0], components[1], components[2]])
  })
  test("type excluded components", () => {
    let T = makeType(b, c, Not(a))
    let components = [b, c, a].map(type => type.components[0])
    expect(T.components).toEqual([components[0], components[1]])
    expect(T.excludedComponents).toEqual([components[2]])
  })
})
