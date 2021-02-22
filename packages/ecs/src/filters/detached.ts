import { createComponentFilter } from "../filter"
import { ComponentState } from "../component"

export const detached = createComponentFilter(() => ({ state }) =>
  state === ComponentState.Detached,
)
