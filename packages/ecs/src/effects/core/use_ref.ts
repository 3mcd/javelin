import { createEffect } from "../../effect"

type RefEffectApi<T> = { value: T }

export const useRef = createEffect(() => {
  let initial = true
  const api = { value: null } as RefEffectApi<unknown>
  return function useRef<T>(initialValue: T) {
    if (initial) {
      api.value = initialValue
      initial = false
    }
    return api as RefEffectApi<T>
  }
})
