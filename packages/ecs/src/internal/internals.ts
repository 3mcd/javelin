import { $flat, Model, Schema } from "@javelin/model"
import { World } from "../world"

export type Internals = {
  componentTypeIndex: WeakMap<Schema, number>
  model: Model
  worlds: World<unknown>[]
  currentWorldId: number
}

export const UNSAFE_internals: Internals = {
  componentTypeIndex: new WeakMap<Schema, number>(),
  model: { [$flat]: {} },
  worlds: [],
  currentWorldId: -1,
}
