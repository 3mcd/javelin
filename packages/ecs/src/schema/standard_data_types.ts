import { mutableEmpty } from "../util/array"
import { createDataType } from "./schema_utils"
import { DataType } from "./schema_types"

export const array = <T>(type: DataType<T>) =>
  createDataType<T[]>({
    name: "array",
    create(value = []) {
      return value
    },
    reset(c, key, defaultValue) {
      if (typeof defaultValue !== "undefined") {
        c[key] = defaultValue.slice()
      } else {
        mutableEmpty(c[key] as unknown[])
      }
    },
  })

export const number = createDataType<number>({
  name: "number",
  create(value = 0) {
    return value
  },
  reset(c, key, value = 0) {
    c[key] = value
  },
})

export const boolean = createDataType<boolean>({
  name: "boolean",
  create(value = false) {
    return value
  },
  reset(c, key, value = false) {
    c[key] = value
  },
})

export const string = createDataType<string>({
  name: "string",
  create(value = "") {
    return value
  },
  reset(c, key, value = "") {
    c[key] = value
  },
})
