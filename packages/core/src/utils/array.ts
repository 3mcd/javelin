import { noop } from "./fp"

export function mutableRemoveUnordered<T>(arr: T[], element: T) {
  const length = arr.length
  const index = arr.indexOf(element)
  if (index === -1) {
    return false
  }
  const last = arr.pop()
  if (index < length - 1) {
    arr[index] = last as T
  }
  return true
}

export function mutableRemoveByIndexUnordered<T>(arr: T[], index: number) {
  const length = arr.length
  if (index === -1) {
    return false
  }
  const last = arr.pop()
  if (index < length - 1) {
    arr[index] = last as T
  }
  return true
}

export function mutableRemove<T>(arr: T[], element: T) {
  const index = arr.indexOf(element)

  if (index === -1) {
    return false
  }

  arr.splice(index, 1)

  return true
}

export function mutableEmpty<T extends unknown[]>(arr: T) {
  while (arr.length > 0) arr.pop()
  return arr
}

export function createArray<T = void>(
  len: number = 0,
  f: (i: number) => T = noop as () => T,
) {
  return Array(len)
    .fill(undefined)
    .map((_, i) => f(i))
}

export type PackedSparseArray<T> = { [key: number]: T }

export function packSparseArray<T>(array: readonly T[]) {
  return array.reduce((a, x, i) => {
    a[i] = x
    return a
  }, {} as PackedSparseArray<T>)
}

export function unpackSparseArray<T>(
  packedSparseArray: PackedSparseArray<T>,
): T[] {
  const sparseArray: T[] = []

  for (const index in packedSparseArray) {
    const i = parseInt(index, 10)

    if (!isNaN(i)) {
      sparseArray[i] = packedSparseArray[index]
    }
  }

  return sparseArray
}
