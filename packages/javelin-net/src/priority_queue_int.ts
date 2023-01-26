import {assert} from "@javelin/lib"

export type T = {
  heap: number[]
  heap_index: number[]
  heap_priorities: number[]
  length: number
  max_length: number
}

export let make = (max_length: number): T => {
  return {
    heap: new Array(max_length),
    heap_index: [],
    heap_priorities: [],
    length: 0,
    max_length,
  }
}

let move = (t: T, item: number, index: number) => {
  t.heap[index] = item
  t.heap_index[item] = index
}

let locate = (t: T, item: number) => {
  return t.heap_index[item]
}

let set_priority = (t: T, index: number, priority: number) => {
  t.heap_priorities[index] = priority
}

let get_priority = (t: T, index: number) => {
  return t.heap_priorities[index]
}

let swap = (t: T, i: number, j: number) => {
  let item_i = t.heap[i]
  let item_j = t.heap[j]
  let priority_i = t.heap_priorities[i]
  let priority_j = t.heap_priorities[j]
  t.heap[i] = item_j
  t.heap[j] = item_i
  t.heap_index[item_i] = j
  t.heap_index[item_j] = i
  t.heap_priorities[i] = priority_j
  t.heap_priorities[j] = priority_i
}

let heapify_up = (t: T, index: number) => {
  while (index > 0) {
    let index_parent: number
    if (index % 2 === 0) {
      index_parent = (index - 2) / 2
    } else {
      index_parent = (index - 1) / 2
    }
    if (get_priority(t, index_parent) >= get_priority(t, index)) {
      return
    }
    swap(t, index, index_parent)
    index = index_parent
  }
}

let heapify_down = (t: T, index: number) => {
  while (index < t.length) {
    let index_l = index * 2 + 1
    let index_r = index * 2 + 2
    let index_max = index
    if (
      index_l <= t.length &&
      get_priority(t, index_l) > get_priority(t, index_max)
    ) {
      index_max = index_l
    }
    if (
      index_r <= t.length &&
      get_priority(t, index_r) > get_priority(t, index_max)
    ) {
      index_max = index_r
    }
    if (index_max === index) {
      return
    }
    swap(t, index, index_max)
    index = index_max
  }
}

export let push = (t: T, item: number, priority: number) => {
  if (locate(t, item) >= 0) {
    remove(t, item)
  }
  if (t.length === t.max_length) {
    return
  }
  move(t, item, t.length)
  set_priority(t, t.length, priority)
  t.length++
  heapify_up(t, t.length - 1)
}

export let pop = (t: T) => {
  if (t.length === 0) {
    return
  }
  let item = t.heap[0]
  t.length--
  move(t, t.heap[t.length], 0)
  set_priority(t, 0, t.heap_priorities[t.length])
  heapify_down(t, 0)
  return item
}

export let clear = (t: T) => {
  t.length = 0
}

export let is_empty = (t: T) => {
  return t.length === 0
}

export let peek = (t: T) => {
  if (is_empty(t)) {
    return
  }
  return t.heap[0]
}

export let remove = (t: T, item: number) => {
  let index = locate(t, item)
  assert(index >= 0)
  let v = t.heap[t.length - 1]
  let p = get_priority(t, t.length - 1)
  t.heap[index] = v
  t.heap[t.length - 1] = undefined!
  t.heap_priorities[t.length - 1] = undefined!
  t.heap_index[item] = undefined!
  t.heap_index[v] = index
  t.heap_priorities[index] = p
  if (get_priority(t, index) > get_priority(t, t.length - 1)) {
    heapify_up(t, index)
  } else if (get_priority(t, index) < get_priority(t, t.length - 1)) {
    heapify_down(t, index)
  }
  t.length--
}
