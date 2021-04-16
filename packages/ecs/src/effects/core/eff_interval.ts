import { createEffect } from "../../effect"
import { effRef } from "./eff_ref"
import { effTimer } from "./eff_timer"

type IntervalEffectApi = boolean

export const effInterval = createEffect(
  () =>
    function effInterval(t: number): IntervalEffectApi {
      const invalidate = effRef(false)
      const done = effTimer(t, invalidate.value)

      invalidate.value = done

      return done
    },
)
