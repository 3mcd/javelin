import { createComponentFilter } from "../filter"

export const detached = createComponentFilter(() => (c, { detached }) =>
  detached.has(c),
)
