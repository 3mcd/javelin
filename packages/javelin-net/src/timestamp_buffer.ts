import {exists} from "@javelin/lib"
import {BTree as BTreeMap} from "./structs/btree_map.js"
import {
  calcTimestampRangeMax,
  calcTimestampRangeMin,
  compareTimestamps,
  makeTimestamp,
  Timestamp,
  timestampIsGreaterThanOrEqualTo,
  timestampIsWithinAcceptableRange,
} from "./timestamp.js"

type TimestampBufferIteratee<T> = (values: T[], timestamp: Timestamp) => void
type TimestampBufferValueIteratee<T> = (value: T, timestamp: Timestamp) => void

const DELETE_OP = {delete: true}

export class TimestampBuffer<T = unknown> {
  #map
  #timestamp

  constructor(map?: BTreeMap<Timestamp, T[]>) {
    this.#map =
      map ?? new BTreeMap<Timestamp, T[]>(undefined, compareTimestamps)
    this.#timestamp = makeTimestamp()
  }

  setTimestamp(timestamp: Timestamp): void {
    this.#timestamp = timestamp
    let minAcceptableTimestamp = calcTimestampRangeMin(timestamp)
    let maxAcceptableTimestamp = calcTimestampRangeMax(timestamp)
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

  drainTo(
    timestamp: Timestamp,
    callback?: TimestampBufferValueIteratee<T>,
  ): void {
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

  forEachBuffer(callback: TimestampBufferIteratee<T>): void {
    this.#map.forEach(callback)
  }

  insert(value: T, timestamp: Timestamp): void {
    if (timestampIsWithinAcceptableRange(this.#timestamp, timestamp)) {
      let values = this.#map.get(timestamp)
      if (values === undefined) {
        this.#map.set(timestamp, (values = []))
      }
      values.push(value)
    } else {
      console.warn("timestamp is outside the acceptable range")
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

  get timestamp() {
    return this.#timestamp
  }

  get maxTimestamp() {
    return this.#map.maxKey()
  }

  get minTimestamp() {
    return this.#map.minKey()
  }
}
