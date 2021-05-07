import { arrayOf, createModel } from "@javelin/core"
import { decode, encode } from "./pack"
import { boolean, int8, string, string8, uint16, uint8 } from "./views"

describe("pack", () => {
  it("encodes and decodes nested schema", () => {
    const model = createModel(
      new Map([
        [
          0,
          {
            x: int8,
            y: int8,
            name: { ...string, length: 10 },
            enabled: boolean,
            a: {
              b: int8,
              c: {
                d: uint16,
              },
            },
          },
        ],
      ]),
    )
    const object = {
      x: -1,
      y: 12,
      name: "ugotowned",
      enabled: true,
      a: { b: 1, c: { d: 999 } },
    }

    const result = decode(encode(object, model[0]), model[0])
    expect(result).toEqual(object)
  })

  it("handles arrays", () => {
    const model = createModel(
      new Map([
        [
          0,
          {
            order: arrayOf(uint8),
            items: arrayOf({
              name: { ...string8, length: 25 },
              weight: uint16,
              attributes: {
                damage: uint16,
              },
            }),
          },
        ],
      ]),
    )
    const object = {
      order: [1, 2, 3],
      items: [
        { name: "sword", weight: 5, attributes: { damage: 12 } },
        { name: "shield", weight: 10, attributes: { damage: 2 } },
      ],
    }

    const result = decode(encode(object, model[0]), model[0])
    expect(object).toEqual(result)
  })

  it("handles nested arrays", () => {
    const model = createModel(
      new Map([
        [
          0,
          {
            pairs: arrayOf(
              arrayOf({
                x: uint8,
              }),
            ),
          },
        ],
      ]),
    )
    const object = {
      pairs: [
        [{ x: 1 }, { x: 2 }],
        [{ x: 3 }, { x: 4 }],
        [{ x: 5 }, { x: 6 }],
      ],
    }

    const result = decode(encode(object, model[0]), model[0])
    expect(object).toEqual(result)
  })
})
