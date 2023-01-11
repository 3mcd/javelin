import {Maybe} from "./types.js"

export class SparseSet<T = unknown> {
  #dense: T[] = []
  #sparse: number[] = []
  #indices: number[] = []

  get size() {
    return this.#dense.length
  }

  get(key: number): Maybe<T> {
    let dense_index = this.#sparse[key]
    if (dense_index === undefined) {
      return undefined
    }
    return this.#dense[dense_index]
  }

  set(key: number, value: T): void {
    let dense_index = this.#sparse[key]
    if (dense_index === undefined) {
      this.#sparse[key] = this.#dense.length
      this.#dense.push(value)
      this.#indices.push(key)
    } else {
      this.#dense[dense_index] = value
    }
  }

  has(key: number) {
    return this.get(key) !== undefined
  }

  delete(key: number): void {
    let dense_index = this.#sparse[key]
    if (dense_index !== undefined) {
      let value = this.#dense[this.#dense.length - 1]
      let sparse_index = this.#indices[this.#indices.length - 1]
      this.#dense[dense_index] = value
      this.#dense.pop()
      this.#indices[dense_index] = sparse_index
      this.#indices.pop()
      this.#sparse[sparse_index] = dense_index
      this.#sparse[key] = undefined!
    }
  }

  keys(): readonly number[] {
    return this.#indices
  }

  values(): T[] {
    return this.#dense
  }

  clear() {
    let key: Maybe<number> = 0
    while ((key = this.#indices.pop()) !== undefined) {
      this.#dense.pop()
      this.#sparse[key] = undefined!
    }
  }

  each(iteratee: (t: T) => void) {
    for (let i = 0; i < this.#dense.length; i++) {
      iteratee(this.#dense[i])
    }
  }
}
