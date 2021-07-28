import { arrayOf, mapOf, number, objectOf, setOf } from "@javelin/core"
import { component } from "./component"
import {
  $changes,
  $delete,
  clearObservedChanges,
  observe,
  ObservedArray,
  ObservedMap,
  ObservedObject,
  ObservedSet,
  ObservedStruct,
  createPatch,
  resetPatch,
} from "./observe"

const Vec2 = { x: number, y: number }

describe("observe", () => {
  it("observes simple schema changes", () => {
    const c = component(Vec2)
    const o = observe(c)
    const x = 1
    const y = 2
    o.x = x
    o.y = y
    const { changes, dirty } = (o as unknown as ObservedStruct)[$changes]
    expect(o.x).toBe(x)
    expect(o.y).toBe(y)
    expect(changes.x).toBe(x)
    expect(changes.y).toBe(y)
    expect(dirty).toBe(true)
  })
  it("observes nested schema changes", () => {
    const c = component({ position: Vec2 })
    const o = observe(c)
    const x = 1
    const y = 2
    o.position.x = x
    o.position.y = y
    const { changes, dirty } = (o.position as unknown as ObservedStruct)[
      $changes
    ]
    expect(o.position.x).toBe(x)
    expect(o.position.y).toBe(y)
    expect(changes.x).toBe(x)
    expect(changes.y).toBe(y)
    expect(dirty).toBe(true)
  })
  it("observes array changes", () => {
    const c = component({ array: arrayOf(number) })
    const o = observe(c)
    const v = 111
    o.array.push(v)
    const { changes, dirty } = (o.array as unknown as ObservedArray)[$changes]
    expect(changes[0]).toBe(v)
    expect(changes.length).toBe(1)
    expect(dirty).toBe(true)
  })
  it("observes complex array elements", () => {
    const c = component({ array: arrayOf(Vec2) })
    const o = observe(c)
    const x = 4
    const y = 2
    o.array.push({ x, y })
    o.array[0].x++
    o.array[0].y++
    const { changes, dirty } = (o.array[0] as unknown as ObservedStruct)[
      $changes
    ]
    expect(changes.x).toBe(x + 1)
    expect(changes.y).toBe(y + 1)
    expect(dirty).toBe(true)
  })
  it("observes object property assignment", () => {
    const c = component({ object: objectOf(number) })
    const o = observe(c)
    const k = "torque"
    const v = 111
    o.object[k] = v
    const { changes, dirty } = (o.object as unknown as ObservedObject)[$changes]
    expect(changes[k]).toBe(v)
    expect(dirty).toBe(true)
  })
  it("observes object property deletion", () => {
    const c = component({ object: objectOf(number) })
    const o = observe(c)
    const k = "torque"
    const v = 111
    o.object[k] = v
    delete o.object[k]
    const { changes, dirty } = (o.object as unknown as ObservedObject)[$changes]
    expect(changes[k]).toBe($delete)
    expect(dirty).toBe(true)
  })
  it("observes complex object properties", () => {
    const c = component({ object: objectOf(Vec2) })
    const o = observe(c)
    const k = "torque"
    const x = 4
    const y = 2
    o.object[k] = { x, y }
    o.object[k].x++
    o.object[k].y++
    const { changes, dirty } = (o.object.torque as unknown as ObservedObject)[
      $changes
    ]
    expect(changes.x).toBe(x + 1)
    expect(changes.y).toBe(y + 1)
    expect(dirty).toBe(true)
  })
  it("observes Set.prototype.add", () => {
    const c = component({ set: setOf(number) })
    const o = observe(c)
    const v = 111
    o.set.add(v)
    const { changes, dirty } = (o.set as unknown as ObservedSet)[$changes]
    expect(changes.add).toContain(v)
    expect(dirty).toBe(true)
  })
  it("observes Set.prototype.delete", () => {
    const c = component({ set: setOf(number) })
    const o = observe(c)
    const v = 111
    o.set.add(v)
    o.set.delete(v)
    const { changes, dirty } = (o.set as unknown as ObservedSet)[$changes]
    expect(changes.delete).toContain(v)
    expect(dirty).toBe(true)
  })
  it.todo("observes Set.prototype.clear")
  it("observes Map.prototype.set", () => {
    const c = component({ map: mapOf(number, number) })
    const o = observe(c)
    const k = 8
    const v = 9
    o.map.set(k, v)
    const { changes, dirty } = (o.map as unknown as ObservedMap)[$changes]
    expect(changes.get(k)).toBe(v)
    expect(dirty).toBe(true)
  })
  it("observes Map.prototype.delete", () => {
    const c = component({ map: mapOf(number, number) })
    const o = observe(c)
    const k = 8
    o.map.set(k, 9)
    o.map.delete(k)
    const { changes, dirty } = (o.map as unknown as ObservedMap)[$changes]
    expect(changes.get(k)).toBe($delete)
    expect(dirty).toBe(true)
  })
  it.todo("observes Map.prototype.clear")
  it("observes complex map values", () => {
    const c = component({ map: mapOf(number, Vec2) })
    const o = observe(c)
    const k = 111
    const x = 4
    const y = 2
    o.map.set(k, { x, y })
    o.map.get(k)!.x++
    o.map.get(k)!.y++
    const { changes, dirty } = (o.map.get(k) as unknown as ObservedStruct)[
      $changes
    ]
    expect(changes.x).toBe(x + 1)
    expect(changes.y).toBe(y + 1)
    expect(dirty).toBe(true)
  })
})

describe("clearObservedChanges", () => {
  it("resets changes", () => {
    const c = component({ map: mapOf(number, Vec2) })
    const o = observe(c)
    const k = 111
    const x = 4
    const y = 2
    o.map.set(k, { x, y })
    o.map.get(k)!.x++
    o.map.get(k)!.y++
    clearObservedChanges(o)
    const { changes, dirty } = (o.map.get(k) as unknown as ObservedStruct)[
      $changes
    ]
    expect(changes.x).toBe(undefined)
    expect(changes.y).toBe(undefined)
    expect(dirty).toBe(false)
  })
})

describe("createPatch", () => {
  it("takes a record of an observed component's changes", () => {
    const c = component({ map: mapOf(number, Vec2) })
    const o = observe(c)
    const k = 111
    const x = 4
    const y = 2
    o.map.set(k, { x, y })
    o.map.get(k)!.x++
    o.map.get(k)!.y++
    const patch = createPatch(o)
    const { changes } = patch.children.get("map")!.children.get(k)!
    expect(changes.get("x")).toBe(5)
    expect(changes.get("y")).toBe(3)
  })
  it("applies changes to existing patch", () => {
    const c = component({ vec: Vec2 })
    const o = observe(c)
    o.vec.x = 1
    o.vec.y = 2
    const s1 = createPatch(o)
    o.vec.x = 3
    createPatch(o, s1)
    expect(s1.children.get("vec")!.changes.get("x")).toBe(3)
  })
})

describe("resetPatch", () => {
  it("clears patch changes", () => {
    const c = component({ vec: Vec2 })
    const o = observe(c)
    o.vec.x = 1
    o.vec.y = 2
    const patch = createPatch(o)
    resetPatch(patch)
    expect(patch.changes.size).toBe(0)
    expect(patch.children.size).toBe(0)
  })
})
