import { effTimer } from "./eff_timer"

jest.mock("../../effect")

describe("effTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(effTimer as any).reset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns false initially", () => {
    const done = effTimer(0)

    expect(done).toBe(false)
  })

  it("returns true after duration passes", () => {
    expect(effTimer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(effTimer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(effTimer(100)).toBe(true)
  })

  it("restarts timer when invalidate is true", () => {
    expect(effTimer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(effTimer(100)).toBe(false)

    effTimer(100, true)

    jest.advanceTimersByTime(50)
    expect(effTimer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(effTimer(100)).toBe(true)
  })
})
