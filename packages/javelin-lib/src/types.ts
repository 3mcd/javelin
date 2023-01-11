export type Nullish = null | undefined

export type Maybe<T> = T | Nullish

export declare const wraps: unique symbol

export interface Wraps<T> {
  readonly [wraps]: T
}

export type Opaque<T, U> = T & Wraps<U>
