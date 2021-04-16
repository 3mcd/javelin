import { effRequest } from "./eff_request"

jest.mock("../../effect")

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

window.AbortController.prototype.abort = jest.fn(
  window.AbortController.prototype.abort,
)

describe("effRequest", () => {
  let response: {}

  beforeEach(() => {
    response = {}
    ;(effRequest as any).reset()
    ;(global as any).fetch = jest.fn(() => Promise.resolve(response))
  })

  it("calls underlying fetch with options", () => {
    const args = ["test", { method: "POST" }] as const

    effRequest(...args)

    expect(fetch).toHaveBeenCalledWith(
      args[0],
      expect.objectContaining(args[1]),
    )
  })

  it("doesn't call underlying fetch with inflight request", async () => {
    const args = ["test", {}] as const

    effRequest(...args)
    effRequest(...args)

    await flushPromises()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("doesn't re-fetch by default", async () => {
    const args = ["test", {}] as const

    effRequest(...args)

    await flushPromises()

    effRequest(...args)

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("aborts request when url parameter is null", async () => {
    effRequest("foo", {})
    effRequest(null, {})

    await flushPromises()

    expect(window.AbortController.prototype.abort).toHaveBeenCalledTimes(1)
  })

  it("initializes with null data", () => {
    const result = effRequest("test", {})
    expect(result).toEqual({ response: null, error: null, done: false })
  })

  it("notifies consumer when response is done", async () => {
    const args = ["test", {}] as const

    effRequest(...args)

    await flushPromises()

    expect(effRequest(...args)).toEqual({ response, error: null, done: true })
  })

  it("notifies consumer when error occurs", async () => {
    const args = ["test", {}] as const
    const error = new Error("foo")

    ;(global as any).fetch = jest.fn(() => Promise.reject(error))
    effRequest(...args)

    await flushPromises()

    expect(effRequest(...args)).toEqual({ response: null, error, done: true })
  })

  it("supports re-fetching via invalidate parameter", async () => {
    const foo = { data: "foo" }
    const bar = { data: "bar" }
    const args = ["test", {}] as const

    response = foo
    effRequest(...args)

    await flushPromises()

    response = bar
    effRequest(...args, true)

    await flushPromises()

    expect(effRequest(...args)).toEqual({
      response: bar,
      error: null,
      done: true,
    })
  })

  it("resets error state on subsequent successful request", async () => {
    const args = ["test", {}] as const
    const error = new Error("foo")

    ;(global as any).fetch = jest.fn(() => Promise.reject(error))
    effRequest(...args)

    await flushPromises()
    ;(global as any).fetch = jest.fn(() => Promise.resolve(response))
    effRequest(...args, true)

    await flushPromises()

    expect(effRequest(...args)).toEqual({ response, error: null, done: true })
  })
})
