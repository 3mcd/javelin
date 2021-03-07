import { deserialize, serialize, field } from "."
import { boolean, int8, string, string8, uint16, uint8 } from "./views"

describe("binary", () => {
  it("serializes and deserializes nested schema", () => {
    const schema = {
      x: field(int8),
      y: field(int8),
      name: field(string, 10),
      enabled: field(boolean),
      a: {
        b: field(int8),
        c: {
          d: field(uint16),
        },
      },
    }
    const object = {
      x: -1,
      y: 12,
      name: "ugotowned",
      enabled: true,
      a: { b: 1, c: { d: 999 } },
    }

    const result = deserialize(serialize(object as any, schema), schema)

    expect(result).toEqual(object)
  })

  it("handles arrays", () => {
    const schema = {
      order: [field(uint8)],
      items: [
        {
          name: field(string8, 25),
          weight: field(uint16),
          attributes: {
            damage: field(uint16),
          },
        },
      ],
    }
    const object = {
      order: [1, 2, 3],
      items: [
        { name: "sword", weight: 5, attributes: { damage: 12 } },
        { name: "shield", weight: 10, attributes: { damage: 2 } },
      ],
    }

    const result = deserialize(serialize(object as any, schema), schema)

    expect(object).toEqual(result)
  })
})
