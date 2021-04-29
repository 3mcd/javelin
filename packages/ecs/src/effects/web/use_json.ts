import { createEffect } from "../../effect"
import { useRef } from "../core"
import { useRequest, RequestEffectApi } from "./use_request"

export const useJson = createEffect(() => {
  let response: unknown

  return function useJson<T>(
    ...args: Parameters<typeof useRequest>
  ): RequestEffectApi<T> {
    const previousResponse = useRef<Response | null>(null)
    const result = useRequest(...args)

    if (result.response && result.response !== previousResponse.value) {
      result.response.json().then((json: T) => {
        response = json
      })
      previousResponse.value = result.response
    }

    return { ...result, response: response || null } as RequestEffectApi<T>
  }
})
