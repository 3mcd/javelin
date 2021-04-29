import { useRef } from "../core/use_ref"
import { useJson } from "./use_json"
import { useRequest } from "./__mocks__/use_request"

jest.mock("../../effect")
jest.mock("./use_request")

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

describe("useJson", () => {
  beforeEach(() => {
    ;(useJson as any).reset()
    ;(useRef as any).reset()
  })

  it("parses json response of request", async () => {
    useJson("foo", {})

    await flushPromises()

    const result = useJson("foo", {})

    expect(await ((result as unknown) as Promise<typeof result>)).toEqual({
      response: await useRequest().response.json(),
      error: null,
      done: true,
    })
  })
})
