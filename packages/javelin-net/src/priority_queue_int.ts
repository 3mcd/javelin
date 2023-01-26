import {assert, Maybe} from "@javelin/lib"

export class PriorityQueueInt<T extends number> {
  #heap
  #index
  #maxLength
  #priorities

  length

  constructor(maxLength: number) {
    this.#heap = [] as T[]
    this.#index = [] as number[]
    this.#maxLength = maxLength
    this.#priorities = [] as number[]
    this.length = 0
  }

  #getIndex(item: T) {
    return this.#index[item]
  }

  #getPriority(index: number) {
    return this.#priorities[index]
  }

  #setPriority(i: number, priority: number) {
    this.#priorities[i] = priority
  }

  #swap(i: number, j: number) {
    let ii = this.#heap[i]
    let ij = this.#heap[j]
    let pi = this.#priorities[i]
    let pj = this.#priorities[j]
    this.#heap[i] = ij
    this.#heap[j] = ii
    this.#index[ii] = j
    this.#index[ij] = i
    this.#priorities[i] = pj
    this.#priorities[j] = pi
  }

  #heapifyUp(i: number) {
    while (i > 0) {
      let ip: number
      if (i % 2 === 0) {
        ip = (i - 2) / 2
      } else {
        ip = (i - 1) / 2
      }
      if (this.#getPriority(ip) >= this.#getPriority(i)) {
        return
      }
      this.#swap(i, ip)
      i = ip
    }
  }

  #heapifyDown(i: number) {
    while (i < this.length) {
      let il = i * 2 + 1
      let ir = i * 2 + 2
      let im = i
      if (il <= this.length && this.#getPriority(il) > this.#getPriority(im)) {
        im = il
      }
      if (ir <= this.length && this.#getPriority(ir) > this.#getPriority(im)) {
        im = ir
      }
      if (im === i) {
        return
      }
      this.#swap(i, im)
      i = im
    }
  }

  #move(item: T, i: number) {
    this.#heap[i] = item
    this.#index[item] = i
  }

  isEmpty() {
    return this.length === 0
  }

  peek(): Maybe<T> {
    if (this.isEmpty()) {
      return
    }
    return this.#heap[0]
  }

  push(item: T, priority: number) {
    if (this.#getIndex(item) >= 0) {
      this.remove(item)
    }
    if (this.length === this.#maxLength) {
      return
    }
    let i = this.length
    this.#move(item, i)
    this.#setPriority(i, priority)
    this.length++
    this.#heapifyUp(i)
  }

  pop() {
    if (this.length === 0) {
      return
    }
    let i = 0
    let item = this.#heap[i]
    this.length--
    this.#move(this.#heap[this.length], i)
    this.#setPriority(i, this.#priorities[this.length])
    this.#heapifyDown(i)
    return item
  }

  remove(item: T) {
    let i = this.#getIndex(item)
    assert(i >= 0)
    let l = this.length - 1
    let v = this.#heap[l]
    let p = this.#getPriority(l)
    this.#heap[i] = v
    this.#heap[l] = undefined!
    this.#index[item] = undefined!
    this.#index[v] = i
    this.#priorities[l] = undefined!
    this.#priorities[i] = p
    if (this.#getPriority(i) > this.#getPriority(l)) {
      this.#heapifyUp(i)
    } else if (this.#getPriority(i) < this.#getPriority(l)) {
      this.#heapifyDown(i)
    }
    this.length--
  }

  clear() {
    this.length = 0
  }
}
