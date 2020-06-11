import { Component } from "@javelin/ecs"

export function createPriorityAccumulator(priorities: Map<number, number>) {
  const weights = new WeakMap<Component, number>()
  const results: Component[] = []

  function remove(component: Component) {
    weights.delete(component)
  }

  function update(component: Component) {
    const baseWeight = priorities.get(component._t)

    if (!baseWeight) {
      throw new Error("Failed to update component weight. Priority not found.")
    }

    const currWeight = weights.get(component) || 0

    weights.set(component, currWeight + baseWeight)

    if (!results.includes(component)) {
      results.push(component)
    }
  }

  function* iterate() {
    results.sort((a, b) => weights.get(a)! - weights.get(b)!)

    let component: Component | undefined

    while ((component = results.pop())) {
      weights.set(component, 0)
      yield component
    }
  }

  return {
    update,
    remove,
    [Symbol.iterator]: iterate,
  }
}
