import {expect} from "@javelin/lib"

let left = (i: number) => 2 * i + 1
let right = (i: number) => 2 * i + 2
let parent = (i: number) => Math.ceil(i / 2) - 1

export class PriorityQueueInt<T extends number> {
  #heap
  #indices
  #priorities

  constructor() {
    this.#heap = [] as T[]
    this.#priorities = [] as number[]
    this.#indices = [] as number[]
  }

  get length() {
    return this.#heap.length
  }

  #getPriorityOfIndex(i: number) {
    return this.#priorities[this.#heap[i]]
  }

  #remove(i: number) {
    if (this.#heap.length === 0) {
      return null
    }
    this.#swap(i, this.#heap.length - 1)
    let item = expect(this.#heap.pop())
    this.#indices[item] = undefined!
    this.#priorities[item] = undefined!
    this.#bubbleDown(i)
    return item
  }

  #swap(i1: number, i2: number) {
    let v1 = this.#heap[i1]
    let v2 = this.#heap[i2]
    this.#indices[v1] = i2
    this.#indices[v2] = i1
    this.#heap[i1] = this.#heap[i2]
    this.#heap[i2] = v1
  }

  #getTopChild(i: number) {
    return right(i) < this.#heap.length &&
      this.#getPriorityOfIndex(right(i)) - this.#getPriorityOfIndex(left(i)) > 0
      ? right(i)
      : left(i)
  }

  #bubbleUp() {
    let i = this.#heap.length - 1

    while (
      parent(i) >= 0 &&
      this.#getPriorityOfIndex(i) - this.#getPriorityOfIndex(parent(i)) > 0
    ) {
      this.#swap(parent(i), i)
      i = parent(i)
    }
  }

  #bubbleDown(i: number) {
    let curr = i
    while (
      left(curr) < this.#heap.length &&
      this.#getPriorityOfIndex(this.#getTopChild(curr)) -
        this.#getPriorityOfIndex(curr) >
        0
    ) {
      let next = this.#getTopChild(curr)
      this.#swap(curr, next)
      curr = next
    }
  }

  getPriority(item: T) {
    if (Number.isNaN(this.#priorities[item])) {
      throw new Error("ahh")
    }
    return this.#priorities[item]
  }

  push(item: T, priority: number) {
    if (this.#indices[item] >= 0) {
      this.remove(item)
    }
    this.#priorities[item] = priority
    this.#indices[item] = this.#heap.push(item) - 1
    this.#bubbleUp()
  }

  peek() {
    return this.#heap[0]
  }

  remove(item: number) {
    this.#remove(this.#indices[item])
  }

  pop() {
    return this.#remove(0)
  }

  isEmpty() {
    return this.#heap.length === 0
  }
}
