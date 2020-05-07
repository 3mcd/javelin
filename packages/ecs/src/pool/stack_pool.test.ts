import { createStackPool } from "./stack_pool"

describe("createStackPool", () => {
  it("creates objects with the `type` argument", () => {
    let count = 0
    const size = 10
    const pool = createStackPool(
      () => ({ x: count++ }),
      obj => obj,
      size,
    )
    pool.allocate()
    for (let i = count - 1; i >= 0; i--) {
      expect(pool.retain().x).toBe(i)
    }
  })
  it("resets objects when released with the `reset` argument", () => {
    const size = 10
    const pool = createStackPool(
      () => ({ x: 0 }),
      obj => {
        obj.x = 1
        return obj
      },
      size,
    )
    pool.allocate()
    for (let i = 0; i < size; i++) {
      const obj = pool.retain()
      pool.release(obj)
      expect(obj.x).toBe(1)
    }
  })
  it("yields the most recent retained object", () => {
    const size = 2
    const pool = createStackPool(
      () => ({ x: 0 }),
      obj => obj,
      size,
    )
    pool.allocate()
    const a = pool.retain()
    const b = pool.retain()

    pool.release(a)
    pool.release(b)

    expect(pool.retain()).toBe(b)
    expect(pool.retain()).toBe(a)
  })
  it("allocates new objects when growing beyond initial size", () => {
    const size = 2
    const type = jest.fn(() => ({ x: 0 }))
    const pool = createStackPool(type, obj => obj, size)

    pool.allocate()

    const a = pool.retain()
    const b = pool.retain()

    type.mockClear()

    const c = pool.retain()

    expect(c).not.toBe(a)
    expect(c).not.toBe(b)
    expect(type).toHaveBeenCalledTimes(2)
  })
})
