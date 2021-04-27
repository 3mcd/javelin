import { createEffect } from "../effect"
import { createObserver } from "../observer"

export const effObserve = createEffect(() => {
  const observer = createObserver()
  return function effObserve(clear: boolean) {
    if (clear) {
      observer.clear()
    }
    return observer
  }
})
