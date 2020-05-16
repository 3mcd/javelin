export interface StackPool<T> {
  allocate(): void
  retain(): T
  release(obj: T): void
}

export function createStackPool<T>(
  type: () => T,
  reset: (obj: T) => T,
  size: number,
): StackPool<T> {
  const heap: T[] = []
  const allocate = () => {
    for (let i = 0; i < size; i++) {
      heap.push(type())
    }
  }
  const retain = () => {
    if (!heap.length) {
      allocate()
    }

    return heap.pop() as T
  }
  const release = (obj: T) => {
    heap.push(reset(obj))
  }

  return {
    allocate,
    retain,
    release,
  }
}
