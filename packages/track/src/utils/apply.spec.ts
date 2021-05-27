import {
  FieldExtract,
  initializeWithSchema,
  mapOf,
  number,
  setOf,
  string,
} from "@javelin/core"
import { component } from "@javelin/ecs"
import { ChangeSet } from "../components"
import { assign, set } from "./write"
import { apply } from "./apply"

const A = {
  x: number,
  nested: {
    y: number,
  },
}
const B = {
  map: mapOf(string, A),
}
const C = {
  map: mapOf(string, B),
}

describe("apply", () => {
  it("applies assignment mutations to schema children", () => {
    const changes = initializeWithSchema(
      {} as FieldExtract<typeof ChangeSet>,
      ChangeSet,
    )
    const a = component(A)
    const b = component(A)
    assign(changes, a, "x", 1)
    assign(changes, a, "nested.y", 2)
    apply(changes, b)
    expect(b.x).toBe(1)
    expect(b.nested.y).toBe(2)
  })
  it("applies set mutations to map children", () => {
    const changes = initializeWithSchema(
      {} as FieldExtract<typeof ChangeSet>,
      ChangeSet,
    )
    const a = component(B)
    const b = component(B)
    const k = "1acefbd"
    set(changes, a, "map", k, { x: 1, nested: { y: 2 } })
    apply(changes, b)
    expect(b.map.get(k)).toEqual({ x: 1, nested: { y: 2 } })
  })
  it("applies set mutations to deeply nested map children", () => {
    const changes = initializeWithSchema(
      {} as FieldExtract<typeof ChangeSet>,
      ChangeSet,
    )
    const a = component(C)
    const b = component(C)
    const k = "1acefbd"
    set(changes, a, "map", "foo", { map: new Map() })
    set(changes, a, "map.foo.map", k, { x: 1, nested: { y: 2 } })
    assign(changes, a, `map.foo.map.${k}.nested.y`, 5)
    apply(changes, b)
    expect(b.map.get("foo")!.map.get(k)).toEqual({ x: 1, nested: { y: 5 } })
  })
})
