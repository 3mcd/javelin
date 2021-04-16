import { createEffect } from "../../effect"

type TimerEffectApi = boolean

export const effTimer = createEffect(() => {
  let state = 0
  let timer: NodeJS.Timeout
  return function effTimer(
    duration: number,
    invalidate: boolean = false,
  ): TimerEffectApi {
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
