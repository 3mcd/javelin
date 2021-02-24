import { createComponentFilter } from "../filter"
import { ComponentState } from "../component"

export const attached = createComponentFilter(() => ({ _cst: _cst }) =>
  _cst === ComponentState.Attaching,
)
