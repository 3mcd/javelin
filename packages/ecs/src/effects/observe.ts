import { assert, createObserver, Observer } from "@javelin/model"
import { Component } from "../component"
import { createEffect } from "../effect"

type ObserveEffectApi = (<T extends Component>(component: T) => T) & Observer

export const observe = createEffect(world => {
  const observer = createObserver()

  let model = world.getModel()

  world.modelChanged.subscribe(m => (model = m))

  const api: ObserveEffectApi = Object.assign(function getObserved<
    T extends Component
  >(component: T): T {
    const type = model[component._tid]
    assert(
      type !== undefined,
      "Failed to observe component: component type not registered",
    )
    return observer.observe(component, type)
  },
  observer)

  return function observeEffect() {
    return api
  }
})
