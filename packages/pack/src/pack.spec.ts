import {
  arrayOf,
  CollatedNode,
  createModel,
  mapOf,
  objectOf,
  Schema,
  setOf,
  string,
} from "@javelin/core"
import { decode, encode } from "./pack"
import {
  boolean,
  ByteView,
  float64,
  int8,
  string16,
  string8,
  StringView,
  uint16,
  uint8,
} from "./views"
import { enhanceModel } from "./index"

describe("pack", () => {
  it("encodes and decodes nested schema", () => {
    const model = enhanceModel(
      createModel(
        new Map<number, Schema>([
          [
            0,
            {
              x: int8,
              y: int8,
              name: { ...string, length: 10 } as StringView,
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
      ),
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

  it("encodes arrays", () => {
    const model = enhanceModel(
      createModel(
        new Map([
          [
            0,
            {
              order: arrayOf(uint8),
              items: arrayOf({
                name: { ...string8, length: 25 } as ByteView,
                weight: uint16,
                attributes: {
                  damage: uint16,
                },
              }),
            },
          ],
        ]),
      ),
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

  it("encodes nested arrays", () => {
    const model = enhanceModel(
      createModel(
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
      ),
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

  it("encodes objects", () => {
    const model = enhanceModel(
      createModel(
        new Map([
          [
            0,
            {
              object: objectOf({ x: float64 }, {
                ...string16,
                length: 4,
              } as StringView),
            },
          ],
        ]),
      ),
    )
    const object = {
      object: {
        "%#$!": {
          x: 1,
        },
      },
    }
    const result = decode(encode(object, model[0]), model[0])
    expect(object).toEqual(result)
  })

  it("encodes empty objects", () => {
    const model = enhanceModel(createModel(new Map([[0, {}]])))
    const object = {}
    const result = decode(encode(object, model[0]), model[0])
    expect(object).toEqual(result)
  })

  it("encodes sets", () => {
    const model = enhanceModel(
      createModel(new Map([[0, { set: setOf({ x: float64 }) }]])),
    )
    const object = {
      set: new Set([{ x: 1.23 }, { x: 4.56 }, { x: 7.89 }]),
    }
    const result = decode(encode(object, model[0]), model[0])
    expect(object).toEqual(result)
  })

  it("encodes maps", () => {
    const model = enhanceModel(
      createModel(new Map([[0, { map: mapOf(float64, { x: float64 }) }]])),
    )
    const object = {
      map: new Map([
        [1, { x: 2 }],
        [3, { x: 4 }],
      ]),
    }
    const result = decode(encode(object, model[0]), model[0])
    expect(object).toEqual(result)
  })

  it("encodes strings", () => {
    const model = enhanceModel(
      createModel(
        new Map([
          [
            0,
            {
              str: { ...string, length: 45 },
              map: mapOf(float64, { x: float64 }),
            },
          ],
        ]),
      ),
    )
    const object = {
      str: "bckjdlkjfasdf",
      map: new Map([[1.2, { x: 99.9 }]]),
    }
    const result = decode(encode(object, model[0]), model[0])
    expect(object).toEqual(result)
  })
})
