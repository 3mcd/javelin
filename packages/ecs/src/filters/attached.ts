import { createComponentFilter } from "../filter"
import { ComponentState } from "../component"

export const attached = createComponentFilter(() => ({ cst }) =>
  cst === ComponentState.Attaching,
)
