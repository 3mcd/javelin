export class SortedRingBuffer<T> {
  #maxLength = 0
  #indices: number[] = []
  #values: T[] = []

  constructor(maxLength: number) {
    this.#maxLength = maxLength
  }

  #getSortedIndex(priority: number) {
    let lo = 0
    let hi = this.#indices.length
    while (lo < hi) {
      let mid = (lo + hi) >>> 1
      if (this.#indices[mid]! < priority) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  push(value: T, priority = Infinity): number {
    let index = this.#getSortedIndex(priority)
    // Move values at indices greater than the target index to the right
    for (let i = this.#values.length; i > index; i--) {
      this.#values[i] = this.#values[i - 1]!
    }
    for (let i = 0; i < this.#indices.length; i++) {
      if (this.#indices[i]! >= index) this.#indices[i]++
    }
    // Insert the new value
    this.#values[index] = value
    // Prune the oldest sample if the queue has reached capacity
    if (this.#indices.unshift(index) > this.#maxLength) {
      let index = this.#indices.pop()!
      let end = this.#values.length - 1
      for (let i = 0; i < this.#indices.length; i++) {
        if (this.#indices[i]! >= index) this.#indices[i]--
      }
      for (let i = index; i < end; i++) {
        this.#values[i] = this.#values[i + 1]!
      }
      this.#values.pop()
    }
    return this.#values.length
  }

  at(index: number): T | undefined {
    return this.#values[index]
  }

  [Symbol.iterator]() {
    return this.#values[Symbol.iterator]()
  }

  get length() {
    return this.#values.length
  }
}
