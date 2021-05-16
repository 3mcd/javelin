import { createEffect } from "../../effect"
import { useRef } from "./use_ref"
import { useTimer } from "./use_timer"

type IntervalEffectApi = boolean

export const useInterval = createEffect(
  () =>
    function useInterval(t: number): IntervalEffectApi {
      const invalidate = useRef(false)
      const done = useTimer(t, invalidate.value)

      invalidate.value = done

      return done
    },
)
