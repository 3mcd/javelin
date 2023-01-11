export const HASH_BASE = 0x811c9dc5 | 0
export const HASH_ENTROPY = 0x01000193 | 0

export let hash_word = (hash: number, term: number) =>
  Math.imul(hash ^ term, HASH_ENTROPY)

export function hash_words(...words: number[]): number
export function hash_words() {
  let hash = HASH_BASE
  for (let i = 0; i < arguments.length; i++) {
    hash = hash_word(hash, arguments[i])
  }
  return normalize_hash(hash)
}

export let normalize_hash = (hash: number) => hash >>> 0
