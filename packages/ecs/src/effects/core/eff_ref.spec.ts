import { effRef } from "./eff_ref"

jest.mock("../../effect")

describe("effRef", () => {
  beforeEach(() => {
    ;(effRef as any).reset()
  })

  it("wraps initial value", () => {
    const a = {}
    const { value } = effRef(a)

    expect(value).toBe(a)
  })

  it("is mutable", () => {
    const a = {}
    const b = {}
    const r = effRef(a)

    r.value = b

    expect(effRef(a).value).toBe(b)
  })
})
