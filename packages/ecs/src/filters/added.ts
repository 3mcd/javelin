import { Component, ComponentType } from "../component"
import { Filter } from "../query"

export function createAddedFilter(...componentTypes: ComponentType[]): Filter {
  const check = componentTypes.length > 0
  const types = componentTypes.map(s => s.type)
  const cache = new Set<number>()

  function matchEntity() {
    return true
  }

  function matchComponent(component: Component) {
    if (check && !types.includes(component._t)) {
      return true
    }

    const hit = cache.has(component._e)

    if (hit) {
      return false
    }

    cache.add(component._e)

    return true
  }

  return { matchEntity, matchComponent }
}
