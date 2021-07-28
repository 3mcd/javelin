import { Comparator, CompareFunction } from "./comparator"

export class Heap<$Value> {
  heapContainer: $Value[]
  compare: Comparator<$Value>

  constructor(comparatorFunction?: CompareFunction<$Value>) {
    if (new.target === Heap) {
      throw new TypeError("Cannot construct Heap instance directly")
    }

    // Array representation of the heap.
    this.heapContainer = []
    this.compare = new Comparator(comparatorFunction)
  }

  getLeftChildIndex(parentIndex: number) {
    return 2 * parentIndex + 1
  }

  getRightChildIndex(parentIndex: number) {
    return 2 * parentIndex + 2
  }

  getParentIndex(childIndex: number) {
    return Math.floor((childIndex - 1) / 2)
  }

  hasParent(childIndex: number) {
    return this.getParentIndex(childIndex) >= 0
  }

  hasLeftChild(parentIndex: number) {
    return this.getLeftChildIndex(parentIndex) < this.heapContainer.length
  }

  hasRightChild(parentIndex: number) {
    return this.getRightChildIndex(parentIndex) < this.heapContainer.length
  }

  leftChild(parentIndex: number) {
    return this.heapContainer[this.getLeftChildIndex(parentIndex)]
  }

  rightChild(parentIndex: number) {
    return this.heapContainer[this.getRightChildIndex(parentIndex)]
  }

  parent(childIndex: number) {
    return this.heapContainer[this.getParentIndex(childIndex)]
  }

  swap(indexOne: number, indexTwo: number) {
    const tmp = this.heapContainer[indexTwo]
    this.heapContainer[indexTwo] = this.heapContainer[indexOne]
    this.heapContainer[indexOne] = tmp
  }

  peek() {
    if (this.heapContainer.length === 0) {
      return null
    }

    return this.heapContainer[0]
  }

  poll() {
    if (this.heapContainer.length === 0) {
      return null
    }

    if (this.heapContainer.length === 1) {
      return this.heapContainer.pop()!
    }

    const item = this.heapContainer[0]

    // Move the last element from the end to the head.
    this.heapContainer[0] = this.heapContainer.pop()!
    this.heapifyDown()

    return item
  }

  add(item: $Value) {
    this.heapContainer.push(item)
    this.heapifyUp()
    return this
  }

  remove(item: $Value, comparator = this.compare) {
    const numberOfItemsToRemove = this.find(item, comparator).length

    for (let iteration = 0; iteration < numberOfItemsToRemove; iteration += 1) {
      const indexToRemove = this.find(item, comparator).pop()!

      if (indexToRemove === this.heapContainer.length - 1) {
        this.heapContainer.pop()
      } else {
        this.heapContainer[indexToRemove] = this.heapContainer.pop()!

        const parentItem = this.parent(indexToRemove)

        if (
          this.hasLeftChild(indexToRemove) &&
          (!parentItem ||
            this.pairIsInCorrectOrder(
              parentItem,
              this.heapContainer[indexToRemove],
            ))
        ) {
          this.heapifyDown(indexToRemove)
        } else {
          this.heapifyUp(indexToRemove)
        }
      }
    }

    return this
  }

  find(item: $Value, comparator = this.compare) {
    const foundItemIndices = []

    for (
      let itemIndex = 0;
      itemIndex < this.heapContainer.length;
      itemIndex += 1
    ) {
      if (comparator.equal(item, this.heapContainer[itemIndex])) {
        foundItemIndices.push(itemIndex)
      }
    }

    return foundItemIndices
  }

  isEmpty() {
    return !this.heapContainer.length
  }

  toString() {
    return this.heapContainer.toString()
  }

  heapifyUp(startIndex = this.heapContainer.length - 1) {
    while (
      this.hasParent(startIndex) &&
      !this.pairIsInCorrectOrder(
        this.parent(startIndex),
        this.heapContainer[startIndex],
      )
    ) {
      this.swap(startIndex, this.getParentIndex(startIndex))
      startIndex = this.getParentIndex(startIndex)
    }
  }

  heapifyDown(customStartIndex = 0) {
    let currentIndex = customStartIndex
    let nextIndex = null

    while (this.hasLeftChild(currentIndex)) {
      if (
        this.hasRightChild(currentIndex) &&
        this.pairIsInCorrectOrder(
          this.rightChild(currentIndex),
          this.leftChild(currentIndex),
        )
      ) {
        nextIndex = this.getRightChildIndex(currentIndex)
      } else {
        nextIndex = this.getLeftChildIndex(currentIndex)
      }

      if (
        this.pairIsInCorrectOrder(
          this.heapContainer[currentIndex],
          this.heapContainer[nextIndex],
        )
      ) {
        break
      }

      this.swap(currentIndex, nextIndex)
      currentIndex = nextIndex
    }
  }

  pairIsInCorrectOrder(firstElement: $Value, secondElement: $Value): boolean {
    throw new Error(`
      You have to implement heap pair comparision method
      for ${firstElement} and ${secondElement} values.
    `)
  }
}
