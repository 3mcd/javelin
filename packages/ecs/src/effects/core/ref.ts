import { createEffect } from "../../effect"

export type RefState<T> = { value: T }

export const ref = createEffect(() => {
  let initial = true
  const state = { value: null } as RefState<unknown>
  return <T>(initialValue: T) => {
    if (initial) {
      state.value = initialValue
      initial = false
    }
    return state as RefState<T>
  }
})
