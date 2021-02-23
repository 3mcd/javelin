import { createComponentFilter } from "../filter"
import { ComponentState } from "../component"

export const detached = createComponentFilter(() => ({ cst }) =>
  cst === ComponentState.Detached,
)
