import { Heap } from "./heap"

export class MinHeap<$Value> extends Heap<$Value> {
  pairIsInCorrectOrder(elementA: $Value, elementB: $Value) {
    return this.compare.lessThanOrEqual(elementA, elementB)
  }
}
