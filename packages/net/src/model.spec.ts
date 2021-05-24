import { arrayOf, createModel, mapOf, objectOf, setOf } from "@javelin/core"
import * as Pack from "@javelin/pack"
import { enhanceModel, float64 } from "@javelin/pack"
import { decodeModel, encodeModel } from "./model"

const A = {
  a: Pack.uint8,
  b: Pack.float64,
  c: {
    d: Pack.uint32,
  },
  e: arrayOf({
    f: Pack.uint16,
  }),
  g: objectOf(
    {
      h: { ...Pack.string8, length: 2 } as Pack.StringView,
      i: { ...Pack.string16, length: 99 } as Pack.StringView,
    },
    { ...Pack.string16, length: 22 } as Pack.StringView,
  ),
  j: mapOf(
    float64,
    arrayOf(
      setOf({
        k: float64,
      }),
    ),
  ),
}

describe("model", () => {
  it("encodes", () => {
    const modelConfig = new Map([[0, A]])
    const model = enhanceModel(createModel(modelConfig))
    const buffer = encodeModel(model)
    const dataView = new DataView(buffer)
    const decoded = decodeModel(dataView, { offset: 0 }, buffer.byteLength)
    expect(JSON.stringify(decoded)).toEqual(JSON.stringify(model))
  })
})
