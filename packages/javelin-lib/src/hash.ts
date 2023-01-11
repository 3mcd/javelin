export const HASH_BASE = 0x811c9dc5 | 0
export const HASH_ENTROPY = 0x01000193 | 0

export let hashWord = (hash: number, term: number) =>
  Math.imul(hash ^ term, HASH_ENTROPY)

export function hashWords(...words: number[]): number
export function hashWords() {
  let hash = HASH_BASE
  for (let i = 0; i < arguments.length; i++) {
    hash = hashWord(hash, arguments[i])
  }
  return normalizeHash(hash)
}

export let normalizeHash = (hash: number) => hash >>> 0
