import { createEffect } from "../../effect"
import { ref } from "./ref"
import { timer } from "./timer"

export const interval = createEffect(() => (t: number) => {
  const invalidate = ref(false)
  const done = timer(t, invalidate.value)

  invalidate.value = done

  return done
})
