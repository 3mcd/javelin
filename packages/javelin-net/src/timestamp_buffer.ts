import {exists} from "@javelin/lib"
import {BTree as BTreeMap} from "./structs/btree_map.js"

type TimestampBufferIteratee<T> = (values: T[], timestamp: number) => void
type TimestampBufferValueIteratee<T> = (value: T, timestamp: number) => void
type TimestampFilterIteratee<T> = (value: T, timestamp: number) => boolean

const DELETE_OP = {delete: true}

let timestampBufferPool: TimestampBuffer[] = []

export let allocTimestampBuffer = <T>(): TimestampBuffer<T> => {
  return (
    (timestampBufferPool.pop() as TimestampBuffer<T>) ?? new TimestampBuffer()
  )
}

export let freeTimestampBuffer = (timestampBuffer: TimestampBuffer) => {
  timestampBufferPool.push(timestampBuffer)
  timestampBuffer.drainAll()
}

export class TimestampBuffer<T = unknown> {
  #map

  constructor(map?: BTreeMap<number, T[]>) {
    this.#map = map ?? new BTreeMap<number, T[]>(undefined)
  }

  drainAll(callback?: TimestampBufferValueIteratee<T>): void {
    if (callback) {
      this.#map.forEach(function drainAndEmitValues(values, timestamp) {
        for (let i = 0; i < values.length; i++) {
          callback?.(values[i], timestamp)
        }
      })
    }
    this.#map.clear()
  }

  drainTo(timestamp: number, callback?: TimestampBufferValueIteratee<T>): void {
    let min = this.#map.minKey()
    this.#map.editRange(
      min!,
      timestamp,
      true,
      function drainAndEmitValues(timestamp, values) {
        if (exists(values)) {
          for (let i = 0; i < values.length; i++) {
            callback?.(values[i], timestamp)
          }
        }
        return DELETE_OP
      },
    )
  }

  filter(maxTimestamp: number, callback: TimestampFilterIteratee<T>): void {
    let minTimestamp = this.#map.minKey()!
    this.#map.editRange(
      minTimestamp,
      maxTimestamp,
      true,
      function drainAndEmitValues(timestamp, values) {
        if (exists(values)) {
          for (let i = values.length - 1; i >= 0; i--) {
            if (!callback(values[i], timestamp)) {
              values.splice(i, 1)
            }
          }
        }
        if (!values || values?.length === 0) {
          return DELETE_OP
        }
      },
    )
  }

  forEachUpTo(maxTimestamp: number, callback: TimestampBufferValueIteratee<T>) {
    let minTimestamp = this.#map.minKey()!
    this.#map.forRange(
      minTimestamp,
      maxTimestamp,
      true,
      function drainAndEmitValues(timestamp, values) {
        if (exists(values)) {
          for (let i = 0; i < values.length; i++) {
            callback(values[i], timestamp)
          }
        }
      },
    )
  }

  forEachBuffer(callback: TimestampBufferIteratee<T>): void {
    this.#map.forEach(callback)
  }

  insert(value: T, timestamp: number): void {
    let values = this.#map.get(timestamp)
    if (values === undefined) {
      this.#map.set(timestamp, (values = []))
    }
    values.push(value)
  }

  reset(from: TimestampBuffer<T>): void {
    this.drainAll()
    for (let [timestamp, commandQueue] of from) {
      let nextCommandQueue = commandQueue.slice()
      this.#map.set(timestamp, nextCommandQueue)
    }
  }

  at(timestamp: number): T[] | undefined {
    return this.#map.get(timestamp)
  }

  [Symbol.iterator](): IterableIterator<[number, T[]]> {
    return this.#map.entries()
  }

  clone(): TimestampBuffer<T> {
    let timestampBuffer = allocTimestampBuffer<T>()
    this.#map.forEach((commands, timestamp) => {
      timestampBuffer.#map.set(timestamp, commands.slice())
    })
    return timestampBuffer
  }

  get length(): number {
    return this.#map.length
  }

  get maxTimestamp() {
    return this.#map.maxKey()
  }

  get minTimestamp() {
    return this.#map.minKey()
  }
}
