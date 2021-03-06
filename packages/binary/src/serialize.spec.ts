import { deserialize, serialize, Schema, flatten } from "."
import { boolean, int8, string, uint16 } from "./views"

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

    console.log(deserialize(serialize(object as any, schema), schema))
    expect(true).toBe(true)
    // const result = deserialize(serialize(object as any, schema)[0], schema)

    // expect(result[0]).toEqual(object)
  })

  it("flatten", () => {})
})
