import { createObserver, Observer, ChangeSet, Model } from "@javelin/model"
import { Component } from "../component"
import { assert } from "../debug"
import { createEffect } from "../effect"

type ObserveEffectApi = (<T extends Component>(component: T) => T) & Observer

export const observe = createEffect(world => {
  const observer = createObserver()

  let model: Model

  const api: ObserveEffectApi = Object.assign(function getObserved<
    T extends Component
  >(component: T): T {
    const type = model[component._tid]
    assert(
      type !== undefined,
      "Failed to observe component: component type not registered",
    )
    return observer.observe(component, model[component._tid])
  },
  observer)

  return function observeEffect() {
    model = world.getModel()
    return api
  }
})
