import {expect, suite, test} from "vitest"
import {makeTagComponent} from "./component"
import {Not} from "./relation"
import {makeQuerySelector, Type} from "./type"

let a = makeTagComponent()
let b = makeTagComponent()
let c = makeTagComponent()

suite("Type", () => {
  test("type memoization", () => {
    let components = [b, c, a]
    let type = Type.fromComponents(components)
    expect(type).toBe(Type.fromComponents(components))
  })
  test("selector memoization", () => {
    let components = [b, c, a]
    let selector = makeQuerySelector(...components)
    expect(selector).toBe(makeQuerySelector(...components))
  })
  test("selector included components", () => {
    let components = [b, c, a]
    let selector = makeQuerySelector(...components)
    expect(selector.components).toEqual(components)
  })
  test("selector excluded components", () => {
    let BCnotA = makeQuerySelector(b, c, Not(a))
    expect(BCnotA.components).toEqual([b, c])
    expect(BCnotA.excludedComponents).toEqual([a])
  })
  test("selector type", () => {
    let components = [b, c, a]
    let selector = makeQuerySelector(...components)
    expect(selector.type).toEqual(Type.fromComponents(components))
  })
  test("selector type with excluded components", () => {
    let BCnotA = makeQuerySelector(b, c, Not(a))
    expect(BCnotA.type).toEqual(Type.fromComponents([b, c]))
  })
})
