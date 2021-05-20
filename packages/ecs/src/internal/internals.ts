import { $flat, Model, Schema, StackPool } from "@javelin/core"
import { Component } from "../component"
import { World } from "../world"

export type Internals = {
  schemaIndex: WeakMap<Schema, number>
  schemaPools: Map<number, StackPool<Component>>
  model: Model
  worlds: World[]
  worldIds: number
  currentWorldId: number
}

export const UNSAFE_internals: Internals = {
  schemaIndex: new WeakMap<Schema, number>(),
  schemaPools: new Map<number, StackPool<Component>>(),
  model: { [$flat]: {} },
  worlds: [],
  worldIds: 0,
  currentWorldId: -1,
}
