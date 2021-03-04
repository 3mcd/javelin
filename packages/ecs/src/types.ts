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
