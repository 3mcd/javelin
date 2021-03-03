import { $reset } from "../../__mocks__/effect"
import { request } from "./request"

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

window.AbortController.prototype.abort = jest.fn(
  window.AbortController.prototype.abort,
)

describe("request", () => {
  let response: {}

  beforeEach(() => {
    response = {}
    ;(request as any)[$reset]()
    ;(global as any).fetch = jest.fn(() => Promise.resolve(response))
  })

  it("calls underlying fetch with options", () => {
    const args = ["test", { method: "POST" }] as const

    request(...args)

    expect(fetch).toHaveBeenCalledWith(
      args[0],
      expect.objectContaining(args[1]),
    )
  })

  it("doesn't call underlying fetch with inflight request", async () => {
    const args = ["test", {}] as const

    request(...args)
    request(...args)

    await flushPromises()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("doesn't re-fetch by default", async () => {
    const args = ["test", {}] as const

    request(...args)

    await flushPromises()

    request(...args)

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("aborts request when url parameter is null", async () => {
    request("foo", {})
    request(null, {})

    await flushPromises()

    expect(window.AbortController.prototype.abort).toHaveBeenCalledTimes(1)
  })

  it("initializes with null data", () => {
    const result = request("test", {})
    expect(result).toEqual({ response: null, error: null, done: false })
  })

  it("notifies consumer when response is done", async () => {
    const args = ["test", {}] as const
    request(...args)
    await flushPromises()
    expect(request(...args)).toEqual({ response, error: null, done: true })
  })

  it("notifies consumer when error occurs", async () => {
    const args = ["test", {}] as const
    const error = new Error("foo")
    ;(global as any).fetch = jest.fn(() => Promise.reject(error))
    request(...args)
    await flushPromises()
    expect(request(...args)).toEqual({ response: null, error, done: true })
  })

  it("supports re-fetching via invalidate parameter", async () => {
    const foo = { data: "foo" }
    const bar = { data: "bar" }
    const args = ["test", {}] as const
    response = foo
    request(...args)
    await flushPromises()
    response = bar
    request(...args, true)
    await flushPromises()
    expect(request(...args)).toEqual({
      response: bar,
      error: null,
      done: true,
    })
  })

  it("resets error state on subsequent successful request", async () => {
    const args = ["test", {}] as const
    const error = new Error("foo")
    ;(global as any).fetch = jest.fn(() => Promise.reject(error))
    request(...args)
    await flushPromises()
    ;(global as any).fetch = jest.fn(() => Promise.resolve(response))
    request(...args, true)
    await flushPromises()
    expect(request(...args)).toEqual({ response, error: null, done: true })
  })
})
