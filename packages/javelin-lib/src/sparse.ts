import {Maybe} from "./types.js"

export class SparseSet<T = unknown> {
  #dense: T[] = []
  #sparse: number[] = []
  #indices: number[] = []

  get size() {
    return this.#dense.length
  }

  get(key: number): Maybe<T> {
    let denseIndex = this.#sparse[key]
    if (denseIndex === undefined) {
      return undefined
    }
    return this.#dense[denseIndex]
  }

  set(key: number, value: T): void {
    let denseIndex = this.#sparse[key]
    if (denseIndex === undefined) {
      this.#sparse[key] = this.#dense.length
      this.#dense.push(value)
      this.#indices.push(key)
    } else {
      this.#dense[denseIndex] = value
    }
  }

  has(key: number) {
    return this.get(key) !== undefined
  }

  delete(key: number): void {
    let denseIndex = this.#sparse[key]
    if (denseIndex !== undefined) {
      let value = this.#dense[this.#dense.length - 1]
      let sparseIndex = this.#indices[this.#indices.length - 1]
      this.#dense[denseIndex] = value
      this.#dense.pop()
      this.#indices[denseIndex] = sparseIndex
      this.#indices.pop()
      this.#sparse[sparseIndex] = denseIndex
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

  each(iteratee: (t: T, k: number) => void) {
    for (let i = 0; i < this.#dense.length; i++) {
      iteratee(this.#dense[i], this.#indices[i])
    }
  }
}
