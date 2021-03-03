import { $reset } from "../../__mocks__/effect"
import { json } from "./json"
import { request } from "./__mocks__/request"

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

jest.mock("./request")

describe("json", () => {
  beforeEach(() => {
    ;(json as any)[$reset]()
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
