import {Maybe} from "./types.js"

class AssertionError extends Error {
  name = "AssertionError"
}

export function assert(
  condition: boolean,
  message?: string,
): asserts condition {
  if (!condition) {
    throw new AssertionError(message)
  }
}

export let expect = <T>(value: Maybe<T>, message?: string): T => {
  /* @__PURE__ */ assert(exists(value), message)
  return value
}

export let exists = <T>(value: Maybe<T>): value is T => value != null
