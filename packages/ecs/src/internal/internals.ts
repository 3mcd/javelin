import { $flat, Model, Schema, StackPool } from "@javelin/core"
import { Component } from "../component"
import { createSignal } from "../signal"
import { World } from "../world"

export type Internals = {
  readonly model: Model
  readonly schemaIndex: WeakMap<Schema, number>
  readonly schemaPools: Map<number, StackPool<Component>>
  readonly worlds: World[]
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

export const UNSAFE_modelChanged = createSignal<Model>()

export function UNSAFE_setModel(model: Model) {
  ;(UNSAFE_internals as { model: Model }).model = model
  UNSAFE_modelChanged.dispatch(model)
}
