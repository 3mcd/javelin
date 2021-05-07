export function assert(
  expression: boolean,
  message: string = "",
  type?: ErrorType,
): asserts expression {
  if (!expression) {
    throw new Error(
      type !== undefined
        ? `${errorMessagePrefixes[type]}: ${message}`
        : message,
    )
  }
}

export enum ErrorType {
  Internal = 0,
  Query = 1,
}

const errorMessagePrefixes: Record<ErrorType, string> = {
  [ErrorType.Internal]: "Internal Error",
  [ErrorType.Query]: "Query Error",
}
