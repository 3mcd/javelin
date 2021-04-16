import { createEffect } from "../../effect"
import { effRef } from "../core"
import { effRequest, RequestEffectApi } from "./eff_request"

export const effJson = createEffect(() => {
  let response: unknown

  return function effJson<T>(
    ...args: Parameters<typeof effRequest>
  ): RequestEffectApi<T> {
    const previousResponse = effRef<Response | null>(null)
    const result = effRequest(...args)

    if (result.response && result.response !== previousResponse.value) {
      result.response.json().then((json: T) => {
        response = json
      })
      previousResponse.value = result.response
    }

    return { ...result, response: response || null } as RequestEffectApi<T>
  }
})
