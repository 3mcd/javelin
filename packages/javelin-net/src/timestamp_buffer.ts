import {BTree as BTreeMap} from "./structs/btree_map.js"
import {
  calcTimestampRangeMax,
  calcTimestampRangeMin,
  compareTimestamps,
  Timestamp,
  timestampIsGreaterThanOrEqualTo,
  timestampIsWithinAcceptableRange,
} from "./timestamp.js"

type TimestampBufferIteratee<T> = (value: T) => void

const DELETE_OP = {delete: true}

export class TimestampBuffer<T> {
  #map

  constructor(map?: BTreeMap<Timestamp, T[]>) {
    this.#map =
      map ?? new BTreeMap<Timestamp, T[]>(undefined, compareTimestamps)
  }

  drainAll(callback?: TimestampBufferIteratee<T>): void {
    if (callback) {
      this.#map.forEach(function emit_drained_values(values) {
        for (let value of values) {
          callback(value)
        }
      })
    }
    this.#map.clear()
  }

  drainTo(timestamp: Timestamp, callback?: TimestampBufferIteratee<T>): void {
    let min = this.#map.minKey()
    this.#map.editRange(
      min!,
      timestamp,
      false,
      function drain_and_emit_values(_, values) {
        if (callback) {
          for (let value of values) {
            callback?.(value)
          }
        }
        return DELETE_OP
      },
    )
  }

  prune(midpoint: Timestamp): void {
    let minAcceptableTimestamp = calcTimestampRangeMin(midpoint)
    let maxAcceptableTimestamp = calcTimestampRangeMax(midpoint)
    // @ts-ignore
    this.drainTo(minAcceptableTimestamp)
    let key: Timestamp | undefined
    while ((key = this.#map.maxKey())) {
      if (timestampIsGreaterThanOrEqualTo(key, maxAcceptableTimestamp)) {
        this.#map.delete(key)
      } else {
        break
      }
    }
  }

  insert(value: T, timestamp: Timestamp, midpoint: Timestamp): void {
    if (timestampIsWithinAcceptableRange(midpoint, timestamp)) {
      let values = this.#map.get(timestamp)
      if (values === undefined) {
        this.#map.set(timestamp, (values = []))
      }
      values.push(value)
    }
  }

  reset(from: TimestampBuffer<T>): void {
    this.drainAll()
    for (let [timestamp, commandQueue] of from) {
      let nextCommandQueue = commandQueue.slice()
      this.#map.set(timestamp, nextCommandQueue)
    }
  }

  at(timestamp: Timestamp): T[] | undefined {
    return this.#map.get(timestamp)
  }

  [Symbol.iterator](): IterableIterator<[Timestamp, T[]]> {
    return this.#map.entries()
  }

  clone(): TimestampBuffer<T> {
    return new TimestampBuffer(
      this.#map.mapValues(commands => commands.slice()),
    )
  }

  get length(): number {
    return this.#map.length
  }
}
