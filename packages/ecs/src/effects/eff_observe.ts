import { createEffect } from "../effect"
import { createObserver } from "../observer"

export const effObserve = createEffect(world => {
  const observer = createObserver()
  world.detached.subscribe((e, components) =>
    components.forEach(observer.reset),
  )
  return function effObserve(clear = true) {
    if (clear) {
      observer.clear()
    }
    return observer
  }
})
