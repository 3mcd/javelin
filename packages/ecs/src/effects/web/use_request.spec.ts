import { useRequest } from "./use_request"

jest.mock("../../effect")

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

;(global as any).AbortController = class AbortController {
  abort() {}
}

global.AbortController.prototype.abort = jest.fn(
  global.AbortController.prototype.abort,
)

describe("useRequest", () => {
  let response: {}

  beforeEach(() => {
    response = {}
    ;(useRequest as any).reset()
    ;(global as any).fetch = jest.fn(() => Promise.resolve(response))
  })

  it("calls underlying fetch with options", () => {
    const args = ["test", { method: "POST" }] as const

    useRequest(...args)

    expect(fetch).toHaveBeenCalledWith(
      args[0],
      expect.objectContaining(args[1]),
    )
  })

  it("doesn't call underlying fetch with inflight request", async () => {
    const args = ["test", {}] as const

    useRequest(...args)
    useRequest(...args)

    await flushPromises()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("doesn't re-fetch by default", async () => {
    const args = ["test", {}] as const

    useRequest(...args)

    await flushPromises()

    useRequest(...args)

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("aborts request when url parameter is null", async () => {
    useRequest("foo", {})
    useRequest(null, {})

    await flushPromises()

    expect(global.AbortController.prototype.abort).toHaveBeenCalledTimes(1)
  })

  it("initializes with null data", () => {
    const result = useRequest("test", {})
    expect(result).toEqual({ response: null, error: null, done: false })
  })

  it("notifies consumer when response is done", async () => {
    const args = ["test", {}] as const

    useRequest(...args)

    await flushPromises()

    expect(useRequest(...args)).toEqual({ response, error: null, done: true })
  })

  it("notifies consumer when error occurs", async () => {
    const args = ["test", {}] as const
    const error = new Error("foo")

    ;(global as any).fetch = jest.fn(() => Promise.reject(error))
    useRequest(...args)

    await flushPromises()

    expect(useRequest(...args)).toEqual({ response: null, error, done: true })
  })

  it("supports re-fetching via invalidate parameter", async () => {
    const foo = { data: "foo" }
    const bar = { data: "bar" }
    const args = ["test", {}] as const

    response = foo
    useRequest(...args)

    await flushPromises()

    response = bar
    useRequest(...args, true)

    await flushPromises()

    expect(useRequest(...args)).toEqual({
      response: bar,
      error: null,
      done: true,
    })
  })

  it("resets error state on subsequent successful request", async () => {
    const args = ["test", {}] as const
    const error = new Error("foo")

    ;(global as any).fetch = jest.fn(() => Promise.reject(error))
    useRequest(...args)

    await flushPromises()
    ;(global as any).fetch = jest.fn(() => Promise.resolve(response))
    useRequest(...args, true)

    await flushPromises()

    expect(useRequest(...args)).toEqual({ response, error: null, done: true })
  })
})
