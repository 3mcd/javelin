import { createEffect } from "../../effect"

export type RequestState<T = Response> =
  // initial
  | {
      error: null
      response: null
      done: false
    }
  // done
  | {
      error: null
      response: T
      done: true
    }
  // error
  | {
      error: string
      response: null
      done: true
    }
  // error (after re-fetch)
  | {
      error: string
      response: T
      done: true
    }
  // invalidated (re-fetch)
  | {
      error: null
      response: T
      done: false
    }

export const request = createEffect(() => {
  let state: RequestState = { response: null, error: null, done: false }
  let fetching = false
  let previousUrl: string
  let abortController = new window.AbortController()

  return (
    url: string | null,
    options: Parameters<typeof fetch>[1],
    invalidate = previousUrl !== undefined && url !== previousUrl,
  ) => {
    if (url === null) {
      return state
    }

    if (invalidate) {
      state = { response: state.response, error: null, done: false }
      abortController.abort()
      abortController = new AbortController()
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
