import { number } from "@javelin/core"
import { $flat, Model, Schema } from "@javelin/core"
import { World } from "../world"

export type Internals = {
  schemaIndex: WeakMap<Schema, number>
  model: Model
  worlds: World[]
  worldIds: number
  currentWorldId: number
}

export const UNSAFE_internals: Internals = {
  schemaIndex: new WeakMap<Schema, number>(),
  model: { [$flat]: {} },
  worlds: [],
  worldIds: 0,
  currentWorldId: -1,
}
