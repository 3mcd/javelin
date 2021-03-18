export type Type = number[]

export const typeHash = (type: Type) => {
  let buckets = 97
  let bucket = type.length % buckets
  for (let i = 0; i < type.length; i++) {
    bucket = (bucket + type[i]) % buckets
  }
  return bucket
}

export const typeIsSuperset = (right: Type, left: Type) => {
  let i = 0
  let j = 0

  if (right.length < left.length) {
    return false
  }

  while (i < right.length && j < left.length) {
    if (right[i] < left[j]) {
      i++
    } else if (right[i] === left[j]) {
      i++
      j++
    } else {
      return false
    }
  }

  return j === left.length
}
