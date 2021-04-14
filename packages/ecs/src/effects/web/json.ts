import { createEffect } from "../../effect"
import { ref } from "../core"
import { request, RequestEffectApi } from "./request"

export const json = createEffect(() => {
  let response: unknown

  return <T>(...args: Parameters<typeof request>): RequestEffectApi<T> => {
    const previousResponse = ref<Response | null>(null)
    const result = request(...args)

    if (result.response && result.response !== previousResponse.value) {
      result.response.json().then((json: T) => {
        response = json
      })
      previousResponse.value = result.response
    }

    return { ...result, response: response || null } as RequestEffectApi<T>
  }
})
