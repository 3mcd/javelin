import { createComponentFilter } from "../filter"

export const changed = createComponentFilter(
  () => (c, { isComponentChanged }) => isComponentChanged(c),
)
