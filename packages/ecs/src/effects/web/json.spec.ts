import { json } from "./json"
import { ref } from "../core/ref"
import { request } from "./__mocks__/request"

jest.mock("../../effect")
jest.mock("./request")

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

describe("json", () => {
  beforeEach(() => {
    ;(json as any).reset()
    ;(ref as any).reset()
  })

  it("parses json response of request", async () => {
    json("foo", {})

    await flushPromises()

    const result = json("foo", {})

    expect(await ((result as unknown) as Promise<typeof result>)).toEqual({
      response: await request().response.json(),
      error: null,
      done: true,
    })
  })
})
