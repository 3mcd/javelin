import { Model } from "@javelin/model"
import { World } from "../world"

export type Globals = {
  __MODEL__: Model
  __WORLDS__: World<unknown>[]
  __CURRENT_WORLD__: number
}

export const globals: Globals = {
  __MODEL__: {},
  __WORLDS__: [],
  __CURRENT_WORLD__: -1,
}
