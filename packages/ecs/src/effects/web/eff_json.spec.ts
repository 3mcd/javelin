import { effRef } from "../core/eff_ref"
import { effJson } from "./eff_json"
import { effRequest } from "./__mocks__/eff_request"

jest.mock("../../effect")
jest.mock("./eff_request")

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

describe("effJson", () => {
  beforeEach(() => {
    ;(effJson as any).reset()
    ;(effRef as any).reset()
  })

  it("parses json response of request", async () => {
    effJson("foo", {})

    await flushPromises()

    const result = effJson("foo", {})

    expect(await ((result as unknown) as Promise<typeof result>)).toEqual({
      response: await effRequest().response.json(),
      error: null,
      done: true,
    })
  })
})
