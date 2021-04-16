import { createEffect } from "../../effect"

type RefEffectApi<T> = { value: T }

export const effRef = createEffect(() => {
  let initial = true
  const api = { value: null } as RefEffectApi<unknown>
  return function effRef<T>(initialValue: T) {
    if (initial) {
      api.value = initialValue
      initial = false
    }
    return api as RefEffectApi<T>
  }
})
