import { Query, QueryResult, Selector } from "../query"

export function reduce<S extends Selector, T>(
  query: Query<S>,
  iteratee: (accumulator: T, ...result: QueryResult<S>) => T,
  initialValue: T,
) {
  let accumulator = initialValue

  for (const queryResult of query) {
    accumulator = iteratee(accumulator as T, ...queryResult)
  }

  return accumulator as T
}
