export function mutableEmpty(arr: unknown[]) {
  while (arr.length > 0) arr.pop()
}
