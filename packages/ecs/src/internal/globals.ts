import { World } from "../world"

export type Globals = {
  __WORLDS__: World<unknown>[]
  __CURRENT_WORLD__: number
}

export const globals: Globals = {
  __WORLDS__: [],
  __CURRENT_WORLD__: -1,
}
