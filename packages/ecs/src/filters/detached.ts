import { createComponentFilter } from "../filter"

export const detached = createComponentFilter(() => (c, w) => c._v === -1)
