export type StackPool<$Value> = {
  allocate(): void
  retain(): $Value
  release(obj: $Value): void
}

export function createStackPool<$Value>(
  type: (pool: StackPool<$Value>) => $Value,
  reset: (obj: $Value) => $Value,
  size: number,
): StackPool<$Value> {
  const heap: $Value[] = []
  const allocate = () => {
    for (let i = 0; i < size; i++) {
      heap.push(type(pool))
    }
  }
  const retain = () => {
    if (!heap.length) {
      allocate()
    }

    return heap.pop() as $Value
  }
  const release = (obj: $Value) => {
    heap.push(reset(obj))
  }

  const pool = {
    allocate,
    retain,
    release,
  }

  return pool
}
