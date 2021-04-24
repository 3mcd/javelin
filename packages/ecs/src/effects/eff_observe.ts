import { createEffect } from "../effect"
import { createObserver } from "../observer"

export const effObserve = createEffect(world => {
  const observer = createObserver()
  return function effObserve() {
    return observer
  }
})
