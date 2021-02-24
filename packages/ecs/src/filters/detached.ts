import { createComponentFilter } from "../filter"
import { ComponentState } from "../component"

export const detached = createComponentFilter(() => ({ _cst: _cst }) =>
  _cst === ComponentState.Detached,
)
