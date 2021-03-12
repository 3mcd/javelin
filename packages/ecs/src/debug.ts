export function assert(
  expression: boolean,
  message: string,
): asserts expression {
  if (!expression) {
    throw new Error(message)
  }
}
