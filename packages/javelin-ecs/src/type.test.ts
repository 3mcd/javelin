import {expect, suite, test} from "vitest"
import {makeTagComponent} from "./component.js"
import {makeQuerySelector, Not, Type} from "./type.js"

let a = makeTagComponent()
let b = makeTagComponent()
let c = makeTagComponent()

suite("Type", () => {
  test("type memoization", () => {
    let components = [b, c, a]
    let type = Type.fromComponents(components)
    expect(type).toBe(makeQuerySelector(...components).type)
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
    let BCnotA = makeQuerySelector(b, c, Not(makeQuerySelector(a)))
    expect(BCnotA.components).toEqual([b, c])
    expect(BCnotA.excludedComponents).toEqual([a])
  })
  test("selector type", () => {
    let components = [b, c, a]
    let selector = makeQuerySelector(...components)
    expect(selector.type).toEqual(makeQuerySelector(...components).type)
  })
  test("selector type with excluded components", () => {
    let BCnotA = makeQuerySelector(b, c, Not(makeQuerySelector(a)))
    expect(BCnotA.type).toEqual(makeQuerySelector(b, c).type)
  })
})
