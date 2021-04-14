import { createEffect } from "../../effect"
import { ref } from "./ref"
import { timer } from "./timer"

type IntervalEffectApi = boolean

export const interval = createEffect(
  () =>
    function intervalEffect(t: number): IntervalEffectApi {
      const invalidate = ref(false)
      const done = timer(t, invalidate.value)

      invalidate.value = done

      return done
    },
)
