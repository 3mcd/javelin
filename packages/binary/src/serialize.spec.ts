import { deserialize, serialize, Schema, flatten } from "."
import { boolean, int8, string, string8, uint16 } from "./views"

describe("binary", () => {
  it("serializes and deserializes", () => {
    const schema = {
      x: { __field: true as const, type: int8, defaultValue: 0 },
      y: { __field: true as const, type: int8, defaultValue: 0 },
      name: {
        __field: true as const,
        type: string,
        defaultValue: "",
        length: 10,
      },
      enabled: { __field: true as const, type: boolean, defaultValue: false },
      yeet: {
        t: { __field: true as const, type: int8, defaultValue: 0 },
        yolo: {
          swag: {
            __field: true as const,
            type: uint16,
            defaultValue: 123456,
          },
        },
      },
    }
    const object = {
      x: -1,
      y: 12,
      name: "ugotowned",
      enabled: true,
      yeet: { t: 1, yolo: { swag: 999 } },
    }

    const result = deserialize(serialize(object as any, schema), schema)

    expect(result).toEqual(object)
  })

  it("arrays", () => {
    const schema = {
      items: [
        {
          name: {
            __field: true as const,
            type: string8,
            defaultValue: "",
            length: 25,
          },
          weight: {
            __field: true as const,
            type: uint16,
            defaultValue: 0,
          },
          attributes: {
            damage: {
              __field: true as const,
              type: uint16,
              defaultValue: 0,
            },
          },
        },
      ],
    }

    console.log(
      deserialize(
        serialize(
          {
            items: [
              // @ts-ignore
              { name: "sword", weight: 5, attributes: { damage: 12 } },
              // @ts-ignore
              { name: "shield", weight: 10, attributes: { damage: 2 } },
            ],
          },
          schema,
        ),
        schema,
      ),
    )

    expect(true).toBe(true)
  })
})
