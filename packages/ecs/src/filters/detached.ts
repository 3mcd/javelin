import { createComponentFilter } from "../filter"
import { $detached } from "../symbols"

export const detached = createComponentFilter(() => c =>
  (c as any)[$detached] === true,
)
