import { Model } from "@javelin/model"
import { createSignal } from "../signal"
import { World } from "../world"

export type Internals = {
  __MODEL__: Model
  __WORLDS__: World<unknown>[]
  __CURRENT_WORLD__: number
}

export const UNSAFE_internals: Internals = {
  __MODEL__: {},
  __WORLDS__: [],
  __CURRENT_WORLD__: -1,
}

export const UNSAFE_modelChanged = createSignal<Model>()

export const setModel = (model: Model) => {
  UNSAFE_internals.__MODEL__ = model
  UNSAFE_modelChanged.dispatch(model)
}
