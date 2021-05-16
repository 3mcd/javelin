export type StackPool<T> = {
  allocate(): void
  retain(): T
  release(obj: T): void
}

export function createStackPool<T>(
  type: (pool: StackPool<T>) => T,
  reset: (obj: T) => unknown,
  size: number,
): StackPool<T> {
  const heap: T[] = []
  const allocate = () => {
    for (let i = 0; i < size; i++) {
      heap.push(type(pool))
    }
  }
  const retain = () => {
    if (!heap.length) {
      allocate()
    }

    return heap.pop() as T
  }
  const release = (obj: T) => {
    reset(obj)
    heap.push(obj)
  }

  const pool = {
    allocate,
    retain,
    release,
  }

  return pool
}
