import {suite, test, expect} from "vitest"
import {make_tag_component} from "./component"
import {ChildOf, Not} from "./relation"
import {makeSlot} from "./slot"
import {ERR_CHILD_OF, ERR_SLOT, makeSelector, Type} from "./type"

let a = make_tag_component()
let b = make_tag_component()
let c = make_tag_component()

suite("Type", () => {
  test("type memoization", () => {
    let components = [b, c, a]
    let type = Type.of(components)
    expect(type).toBe(Type.of(components))
  })
  test("selector memoization", () => {
    let components = [b, c, a]
    let selector = makeSelector(...components)
    expect(selector).toBe(makeSelector(...components))
  })
  test("selector included components", () => {
    let components = [b, c, a]
    let selector = makeSelector(...components)
    expect(selector.includedComponents).toEqual(components)
  })
  test("selector excluded components", () => {
    let BCnotA = makeSelector(b, c, Not(a))
    expect(BCnotA.includedComponents).toEqual([b, c])
    expect(BCnotA.excludedComponents).toEqual([a])
  })
  test("selector type", () => {
    let components = [b, c, a]
    let selector = makeSelector(...components)
    expect(selector.type).toEqual(Type.of(components))
  })
  test("selector type with excluded components", () => {
    let BCnotA = makeSelector(b, c, Not(a))
    expect(BCnotA.type).toEqual(Type.of([b, c]))
  })
})
