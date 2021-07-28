import { $flat, Model, Schema, StackPool } from "@javelin/core"
import { Component } from "../component"
import { createSignal } from "../signal"
import { World } from "../world"

export type Internals = {
  readonly instanceTypeLookup: WeakMap<object, number>
  readonly model: Model
  readonly schemaIndex: WeakMap<Schema, number>
  readonly schemaPools: Map<number, StackPool<Component>>
  readonly worlds: World[]
  currentWorldId: number
  worldIds: number
}

export const UNSAFE_internals: Internals = {
  instanceTypeLookup: new WeakMap(),
  model: { [$flat]: {} },
  schemaIndex: new WeakMap<Schema, number>(),
  schemaPools: new Map<number, StackPool<Component>>(),
  worlds: [],
  currentWorldId: -1,
  worldIds: 0,
}

export const UNSAFE_modelChanged = createSignal<Model>()

export function UNSAFE_setModel(model: Model) {
  ;(UNSAFE_internals as { model: Model }).model = model
  UNSAFE_modelChanged.dispatch(model)
}
