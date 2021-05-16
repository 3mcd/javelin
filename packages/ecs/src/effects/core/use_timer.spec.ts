import { useTimer } from "./use_timer"

jest.mock("../../effect")

describe("useTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(useTimer as any).reset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns false initially", () => {
    const done = useTimer(0)

    expect(done).toBe(false)
  })

  it("returns true after duration passes", () => {
    expect(useTimer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(useTimer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(useTimer(100)).toBe(true)
  })

  it("restarts timer when invalidate is true", () => {
    expect(useTimer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(useTimer(100)).toBe(false)

    useTimer(100, true)

    jest.advanceTimersByTime(50)
    expect(useTimer(100)).toBe(false)

    jest.advanceTimersByTime(50)
    expect(useTimer(100)).toBe(true)
  })
})
