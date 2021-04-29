import { useRef } from "./use_ref"

jest.mock("../../effect")

describe("useRef", () => {
  beforeEach(() => {
    ;(useRef as any).reset()
  })

  it("wraps initial value", () => {
    const a = {}
    const { value } = useRef(a)

    expect(value).toBe(a)
  })

  it("is mutable", () => {
    const a = {}
    const b = {}
    const r = useRef(a)

    r.value = b

    expect(useRef(a).value).toBe(b)
  })
})
