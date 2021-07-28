import { createEffect } from "../../effect"

type RefEffectApi<$Value> = { value: $Value }

export const useRef = createEffect(() => {
  let initial = true
  const api = { value: null } as RefEffectApi<unknown>
  return function useRef<$Value>(initialValue: $Value) {
    if (initial) {
      api.value = initialValue
      initial = false
    }
    return api as RefEffectApi<$Value>
  }
})
