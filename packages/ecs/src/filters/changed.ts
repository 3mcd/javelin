import { Component } from "../component"
import { createComponentFilter } from "../filter"

export const changed = createComponentFilter(() => {
  const cache = new WeakMap<Component, number>()

  return c => {
    const last = cache.get(c)
    const hit = c._v !== (last === undefined ? -Infinity : last)

    if (hit) {
      cache.set(c, c._v)
    }

    return hit
  }
})
