import { QueryFilterLike } from "../query"
import { Component, ComponentSpec } from "../component"

export function changed(...specs: ComponentSpec[]): QueryFilterLike {
  const check = specs.length > 0
  const types = specs.map(s => s.type)
  const cache = new WeakMap<Component, number>()

  function match(component: Component) {
    if (check && !types.includes(component._t)) {
      return true
    }

    const last = cache.get(component) || 0
    const hit = component._v > last

    if (hit) {
      cache.set(component, component._v)
    }

    return hit
  }

  return { match }
}
