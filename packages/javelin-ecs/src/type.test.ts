import {suite, test, expect} from "vitest"
import {makeTagComponent} from "./component"
import {ChildOf, Not} from "./relation"
import {makeSlot} from "./slot"
import {ERR_CHILD_OF, ERR_SLOT, makeSelector, Type} from "./type"

let a = makeTagComponent()
let b = makeTagComponent()
let c = makeTagComponent()

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
  test("multiple parent error", () => {
    expect(() => makeSelector(ChildOf(0), ChildOf(1))).toThrow(
      ERR_CHILD_OF,
    )
  })
  test("multiple slot component error", () => {
    let A = makeSelector(a)
    let B = makeSelector(b)
    let AorB = makeSlot(A, B)
    expect(() => makeSelector(AorB(A), AorB(B))).toThrowError(
      ERR_SLOT,
    )
  })
})
