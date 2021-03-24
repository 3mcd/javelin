import { interval } from "./interval"
import { timer } from "./timer"
import { ref } from "./ref"

jest.mock("../../effect")

describe("interval", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(interval as any).reset()
    ;(timer as any).reset()
    ;(ref as any).reset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns false initially", () => {
    expect(interval(0)).toBe(false)
  })

  it("cycles between true and false as interval duration is reached", () => {
    expect(interval(100)).toBe(false)
    jest.advanceTimersByTime(100)

    expect(interval(100)).toBe(true)
    jest.advanceTimersByTime(100)

    expect(interval(100)).toBe(false)
    jest.advanceTimersByTime(100)

    expect(interval(100)).toBe(true)
    jest.advanceTimersByTime(100)
  })
})
