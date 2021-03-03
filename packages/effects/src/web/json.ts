import { createEffect } from "@javelin/ecs"
import { request } from "./request"

export const json = createEffect(
  () => <T>(...args: Parameters<typeof request>) => {
    const result = request(...args)
    return result.response
      ? result.response
          .json()
          .then((json: T) => ({ ...result, response: json }))
      : result
  },
)
