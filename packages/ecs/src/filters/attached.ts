import { createComponentFilter } from "../filter"

export const attached = createComponentFilter(() => (c, { attached }) =>
  attached.has(c),
)
