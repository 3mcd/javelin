import { $flat, Model, Schema } from "@javelin/core"
import { World } from "../world"

export type Internals = {
  schemaIndex: WeakMap<Schema, number>
  model: Model
  worlds: World<unknown>[]
  currentWorldId: number
}

export const UNSAFE_internals: Internals = {
  schemaIndex: new WeakMap<Schema, number>(),
  model: { [$flat]: {} },
  worlds: [],
  currentWorldId: -1,
}
