import { useInterval } from "./use_interval"
import { useRef } from "./use_ref"
import { useTimer } from "./use_timer"

jest.mock("../../effect")

describe("useInterval", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(useInterval as any).reset()
    ;(useTimer as any).reset()
    ;(useRef as any).reset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns false initially", () => {
    expect(useInterval(0)).toBe(false)
  })

  it("cycles between true and false as interval duration is reached", () => {
    expect(useInterval(100)).toBe(false)
    jest.advanceTimersByTime(100)

    expect(useInterval(100)).toBe(true)
    jest.advanceTimersByTime(100)

    expect(useInterval(100)).toBe(false)
    jest.advanceTimersByTime(100)

    expect(useInterval(100)).toBe(true)
    jest.advanceTimersByTime(100)
  })
})
