import { globals } from "./internal/globals"
import { World } from "./world"
import { createEffect } from "./effect"

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

describe("createEffect", () => {
  const reset = (currentTick = 0, currentWorld = 0, currentSystem = 0) => {
    globals.__WORLDS__ = [
      { id: 0, state: { currentTick, currentSystem } } as World,
      { id: 1, state: { currentTick, currentSystem } } as World,
    ]
    globals.__CURRENT_WORLD__ = currentWorld
  }

  beforeEach(() => {
    reset()
  })

  it("executes callback once per effect call", () => {
    const callback = jest.fn()
    const effect = createEffect(() => callback)

    effect("foo")
    effect()

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(
      globals.__WORLDS__[globals.__CURRENT_WORLD__],
      "foo",
    )
  })

  it("returns value of callback", () => {
    const effect = createEffect(() => {
      let value = 1
      return () => value
    })

    expect(effect()).toBe(1)
  })

  it("creates closure for each effect call", () => {
    const effect = createEffect(() => (world, x: number) => x + 1)

    expect(effect(1)).toBe(2)
    expect(effect(2)).toBe(3)
    expect(effect(3)).toBe(4)

    reset()

    expect(effect(1)).toBe(2)
    expect(effect(2)).toBe(3)
    expect(effect(3)).toBe(4)
  })

  it("creates new closures per-world", () => {
    const effect = createEffect(() => {
      let x = 0
      return (world, n: number) => {
        x += n
        return [world, x] as const
      }
    })

    effect(1)
    reset(1)
    effect(1)
    reset(0, 1)
    effect(2)
    reset(0, 0)
    let [worldA, stateA] = effect(1)
    reset(0, 1)
    let [worldB, stateB] = effect(2)

    expect(worldA.id).toBe(0)
    expect(stateA).toBe(3)
    expect(worldB.id).toBe(1)
    expect(stateB).toBe(4)
  })

  it("updates state with resolved promise value", async () => {
    jest.useFakeTimers()
    const callback = jest.fn(() => Promise.resolve("foo"))
    const effect = createEffect(() => callback)

    effect()
    await flushPromises()
    reset(1)

    expect(effect()).toBe("foo")
  })

  it("awaits promises before next callback execution", async () => {
    jest.useFakeTimers()

    const callback = jest.fn(() => Promise.resolve())
    const effect = createEffect(() => callback)

    effect()
    reset(1)
    effect()

    expect(callback).toHaveBeenCalledTimes(1)

    await flushPromises()

    reset(2)
    effect()

    expect(callback).toHaveBeenCalledTimes(2)

    jest.useRealTimers()
  })

  it("reuses same closure for global mode", () => {
    const callback = jest.fn()
    const effect = createEffect(() => callback)

    effect()
    effect()

    reset(1)

    effect()
    effect()

    expect(callback).toHaveBeenCalledTimes(4)
  })

  it("throws when executing fewer effects than previous tick", () => {
    const effect = createEffect(() => () => {})

    effect()
    effect()

    reset(1)

    effect()

    reset(2)

    expect(() => effect()).toThrow()
  })

  it("throws when executing more effects than previous tick", () => {
    const effect = createEffect(() => () => {})

    effect()
    effect()

    reset(1)

    effect()
    effect()
    effect()

    reset(2)

    expect(() => effect()).toThrow()
  })

  it("doesn't throw when encoutering effects new system", () => {
    const effect = createEffect(() => () => {})

    effect()
    effect()

    reset(1, 0, 0)

    effect()
    effect()

    reset(2, 0, 1)

    effect()

    expect(() => reset(3, 0, 0)).not.toThrow()
  })
})
