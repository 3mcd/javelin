import { ref } from "./ref"

jest.mock("../../effect")

describe("ref", () => {
  beforeEach(() => {
    ;(ref as any).reset()
  })

  it("wraps initial value", () => {
    const a = {}
    const { value } = ref(a)

    expect(value).toBe(a)
  })

  it("is mutable", () => {
    const a = {}
    const b = {}
    const r = ref(a)

    r.value = b

    expect(ref(a).value).toBe(b)
  })
})
