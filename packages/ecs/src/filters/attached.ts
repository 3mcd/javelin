import { createComponentFilter } from "../filter"

export const attached = createComponentFilter(() => (c, w) => w.attached.has(c))
