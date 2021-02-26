import { World } from "../world"

export type Globals = {
  __CURRENT__WORLD__: World<unknown> | null
}

export const globals: Globals = {
  __CURRENT__WORLD__: null,
}
