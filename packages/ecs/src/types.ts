export type Mutable<$Type> = {
  -readonly [P in keyof $Type]: $Type[P] extends ReadonlyArray<infer $Element>
    ? $Element[]
    : $Type[P]
}

export type MutableDeep<$Type> = {
  -readonly [P in keyof $Type]: $Type[P] extends {}
    ? MutableDeep<$Type[P]>
    : $Type[P] extends ReadonlyArray<infer $Element>
    ? $Element[]
    : $Type[P]
}
