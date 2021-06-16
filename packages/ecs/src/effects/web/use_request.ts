import { createEffect } from "../../effect"

type RequestStateInitial = {
  error: null
  response: null
  done: false
}

type RequestStateDone<T> = {
  error: null
  response: T
  done: true
}

type RequestStateInvalidated<T> = {
  error: null
  response: T
  done: false
}

type RequestStateError = {
  error: string
  response: null
  done: true
}

type RequestStateErrorAfterInvalidate<T> = {
  error: string
  response: T
  done: true
}

export type RequestEffectApi<T = Response> =
  | RequestStateInitial
  | RequestStateDone<T>
  | RequestStateInvalidated<T>
  | RequestStateError
  | RequestStateErrorAfterInvalidate<T>

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
