import { createEffect } from "../../effect"

export const timer = createEffect(() => {
  let state = 0
  let timer: NodeJS.Timeout
  return (duration: number, invalidate: boolean = false) => {
    if (invalidate) {
      state = 0
      clearTimeout(timer)
    }
    if (state === 0) {
      state = 1
      timer = setTimeout(() => {
        state = 2
      }, duration)
    }
    return state === 2
  }
})
