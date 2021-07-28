import { createEffect } from "../../effect"

type RequestStateInitial = {
  error: null
  response: null
  done: false
}

type RequestStateDone<$Response> = {
  error: null
  response: $Response
  done: true
}

type RequestStateInvalidated<$Response> = {
  error: null
  response: $Response
  done: false
}

type RequestStateError = {
  error: string
  response: null
  done: true
}

type RequestStateErrorAfterInvalidate<$Response> = {
  error: string
  response: $Response
  done: true
}

export type RequestEffectApi<$Response = Response> =
  | RequestStateInitial
  | RequestStateDone<$Response>
  | RequestStateInvalidated<$Response>
  | RequestStateError
  | RequestStateErrorAfterInvalidate<$Response>

export const useRequest = createEffect(() => {
  let state: RequestEffectApi = { response: null, error: null, done: false }
  let fetching = false
  let previousUrl: string
  let abortController = new (
    typeof window === "object" ? window : global
  ).AbortController()

  return function useRequest(
    url: string | null,
    options: Parameters<typeof fetch>[1],
    invalidate = previousUrl !== undefined && url !== previousUrl,
  ) {
    if (url === null || invalidate) {
      abortController.abort()
      abortController = new AbortController()
    }
    if (url === null) {
      return state
    }

    if (invalidate) {
      state = { response: state.response, error: null, done: false }
    }

    if (state.done) {
      return state
    }

    if (!fetching) {
      fetching = true
      previousUrl = url
      fetch(url, { ...options, signal: abortController.signal })
        .then(response => {
          state = { response, error: null, done: true }
        })
        .catch(error => {
          state = { response: state.response, error, done: true }
        })
        .then(() => {
          fetching = false
        })
    }

    return state
  }
})
