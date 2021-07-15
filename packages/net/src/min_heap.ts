import { Heap } from "./heap"

export class MinHeap<T> extends Heap<T> {
  pairIsInCorrectOrder(elementA: T, elementB: T) {
    return this.compare.lessThanOrEqual(elementA, elementB)
  }
}
