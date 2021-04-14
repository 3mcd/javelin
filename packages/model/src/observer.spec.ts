import { arrayOf } from "../dist/cjs"
import { createModel, number } from "./model"
import { createObserver } from "./observer"

describe("observer", () => {
  it("observes top-level object mutations", () => {
    const id = 0
    const config = new Map([[id, { x: number, y: number }]])
    const model = createModel(config)
    const observer = createObserver()
    const instance = { x: 0, y: 0 }
    const observed = observer.observe(instance, model[id])
    const changes = observer.changes.get(instance)!

    observed.x = 1
    observed.y = 2

    expect(changes.fields[0 /* x */]).toEqual({ field: 0, value: 1 })
    expect(changes.fields[1 /* y */]).toEqual({ field: 1, value: 2 })
  })

  it("observes array mutations", () => {
    const id = 0
    const config = new Map([[id, { x: number, y: number }]])
    const model = createModel(config)
    const observer = createObserver()
    const instance = { x: 0, y: 0 }
    const observed = observer.observe(instance, model[id])
    const changes = observer.changes.get(instance)!

    observed.x = 1
    observed.y = 2

    expect(changes.fields[0 /* x */]).toEqual({ field: 0, value: 1 })
    expect(changes.fields[1 /* y */]).toEqual({ field: 1, value: 2 })
  })

  it("observes mutating array methods", () => {
    const id = 0
    const config = new Map([[id, { x: number, y: number }]])
    const model = createModel(config)
    const observer = createObserver()
    const instance = { x: 0, y: 0 }
    const observed = observer.observe(instance, model[id])
    const changes = observer.changes.get(instance)!

    observed.x = 1
    observed.y = 2

    expect(changes.fields[0 /* x */]).toEqual({ field: 0, value: 1 })
    expect(changes.fields[1 /* y */]).toEqual({ field: 1, value: 2 })
  })

  it("ignores non-mutating array methods", () => {
    const config = new Map([[0, { array: arrayOf(number) }]])
    const model = createModel(config)
    const observer = createObserver()
    const instance = { array: [1, 2, 3] }
    const observed = observer.observe(instance, model[0])
    const changes = observer.changes.get(instance)!
    const noop = jest.fn()

    observed.array.map(noop)
    observed.array.forEach(noop)

    expect(changes.arrays).toEqual([])
    expect(changes.fields).toEqual({})
  })
})
