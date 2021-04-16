import { effInterval } from "./eff_interval"
import { effRef } from "./eff_ref"
import { effTimer } from "./eff_timer"

jest.mock("../../effect")

describe("effInterval", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(effInterval as any).reset()
    ;(effTimer as any).reset()
    ;(effRef as any).reset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns false initially", () => {
    expect(effInterval(0)).toBe(false)
  })

  it("cycles between true and false as interval duration is reached", () => {
    expect(effInterval(100)).toBe(false)
    jest.advanceTimersByTime(100)

    expect(effInterval(100)).toBe(true)
    jest.advanceTimersByTime(100)

    expect(effInterval(100)).toBe(false)
    jest.advanceTimersByTime(100)

    expect(effInterval(100)).toBe(true)
    jest.advanceTimersByTime(100)
  })
})
