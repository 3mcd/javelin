export type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P]
}

export type MutableDeep<T> = {
  -readonly [P in keyof T]: T[P] extends {}
    ? MutableDeep<T[P]>
    : T[P] extends ReadonlyArray<infer U>
    ? U[]
    : T[P]
}

export type CollectionRecord = unknown | unknown[]
export type CollectionIteratee<R extends CollectionRecord> = R extends unknown[]
  ? (key: R[0], value: R[1]) => unknown
  : (value: R) => unknown
export type Collection<R extends CollectionRecord, I = R> = {
  forEach(iteratee: CollectionIteratee<R>): void
  [Symbol.iterator](): IterableIterator<I>
}
