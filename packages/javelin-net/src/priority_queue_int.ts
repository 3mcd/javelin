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

  #priority(i: number) {
    return this.#priorities[this.#heap[i]]
  }

  #remove(i = 0) {
    if (this.#heap.length === 0) {
      return null
    }
    this.#swap(i, this.#heap.length - 1)
    let item = expect(this.#heap.pop())
    this.#indices[item] = undefined!
    this.#bubbleDown(i)
    return item
  }

  #swap(i1: number, i2: number) {
    this.#indices[this.#heap[i1]] = i2
    this.#indices[this.#heap[i2]] = i1
    let v1 = this.#heap[i1]
    this.#heap[i1] = this.#heap[i2]
    this.#heap[i2] = v1
  }

  #getTopChild(i: number) {
    return right(i) < this.#heap.length &&
      this.#priority(right(i)) - this.#priority(left(i)) > 0
      ? right(i)
      : left(i)
  }

  #bubbleUp() {
    let i = this.#heap.length - 1

    while (
      parent(i) >= 0 &&
      this.#priority(i) - this.#priority(parent(i)) > 0
    ) {
      this.#swap(parent(i), i)
      i = parent(i)
    }
  }

  #bubbleDown(i = 0) {
    let curr = i
    while (
      left(curr) < this.#heap.length &&
      this.#priority(this.#getTopChild(curr)) - this.#priority(curr) > 0
    ) {
      let next = this.#getTopChild(curr)
      this.#swap(curr, next)
      curr = next
    }
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
    return this.#remove()
  }

  isEmpty() {
    return this.#heap.length === 0
  }

  _heap() {
    return this.#heap
  }
}
