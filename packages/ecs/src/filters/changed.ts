import { Component, ComponentType } from "../component"
import { Filter } from "../query"

export function changed(...componentTypes: ComponentType[]): Filter {
  const check = componentTypes.length > 0
  const types = componentTypes.map(s => s.type)
  const cache = new WeakMap<Component, number>()

  function matchEntity(entity: number) {
    return true
  }

  function matchComponent(component: Component) {
    if (check && !types.includes(component._t)) {
      return true
    }

    const last = cache.get(component)
    const hit = component._v > (last === undefined ? -1 : last)

    if (hit) {
      cache.set(component, component._v)
    }

    return hit
  }

  return { matchEntity, matchComponent }
}
