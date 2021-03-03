import { timer } from "./timer"

jest.mock("../../effect")

describe("timer", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(timer as any).reset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns false initially", () => {
    const done = timer(0)

    expect(done).toBe(false)
  })

  it("returns true after duration passes", () => {
    expect(timer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(timer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(timer(100)).toBe(true)
  })

  it("restarts timer when invalidate is true", () => {
    expect(timer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(timer(100)).toBe(false)

    timer(100, true)

    jest.advanceTimersByTime(50)
    expect(timer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(timer(100)).toBe(true)
  })
})
