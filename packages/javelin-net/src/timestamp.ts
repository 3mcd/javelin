import type {Opaque} from "@javelin/lib"

export type Timestamp = Opaque<number, "Timestamp">
export type FloatTimestamp = Opaque<number, "FloatTimestamp">
export type Timestamped<T> = T & {timestamp: Timestamp}

export const TIMESTAMP_MIN = -32768
export const TIMESTAMP_MAX = 32767

const MAX_FROM_MIDPOINT = Math.ceil(TIMESTAMP_MAX / 2)
const wrapI16 = new Int16Array(1)

export function remEuclid(left: number, right: number): number {
  let remainder = left % right
  return remainder < 0 ? remainder + Math.abs(right) : remainder
}

export function makeTimestamp(value = 0): Timestamp {
  wrapI16[0] = value
  return wrapI16[0] as Timestamp
}

export function makeTimestampFromTime(
  time: number,
  unitTime: number,
): Timestamp {
  return makeTimestamp(makeFloatTimestampFromTime(time, unitTime))
}

export function addTimestamps(
  timestamp: Timestamp,
  right: Timestamp | number,
): Timestamp {
  return makeTimestamp(timestamp + right)
}

export function subtractTimestamps(
  timestamp: Timestamp,
  right: Timestamp | number,
): Timestamp {
  return makeTimestamp(timestamp - right)
}

export function calcTimestampRangeMin(midpoint: Timestamp): Timestamp {
  return subtractTimestamps(midpoint, MAX_FROM_MIDPOINT)
}

export function calcTimestampRangeMax(midpoint: Timestamp): Timestamp {
  return addTimestamps(midpoint, MAX_FROM_MIDPOINT)
}

export function compareTimestamps(left: Timestamp, right: Timestamp): number {
  let difference = subtractTimestamps(left, right)
  if (difference < 0) {
    return -1
  }
  if (difference === 0) {
    return 0
  }
  return 1
}

export function timestampIsWithinAcceptableRange(
  midpoint: Timestamp,
  timestamp: Timestamp,
): boolean {
  return (
    compareTimestamps(timestamp, calcTimestampRangeMin(midpoint)) >= 0 &&
    compareTimestamps(timestamp, calcTimestampRangeMax(midpoint)) <= 0
  )
}

export function incrementTimestamp(timestamp: Timestamp): Timestamp {
  return makeTimestamp(timestamp + 1)
}

export function timestampToTime(
  timestamp: Timestamp,
  unitTime: number,
): number {
  return timestamp * unitTime
}

export function timestampIsEqualTo(left: Timestamp, right: Timestamp): boolean {
  return compareTimestamps(left, right) === 0
}

export function timestampIsGreaterThan(
  left: Timestamp,
  right: Timestamp,
): boolean {
  return compareTimestamps(left, right) === 1
}

export function timestampIsGreaterThanOrEqualTo(
  left: Timestamp,
  right: Timestamp,
): boolean {
  return compareTimestamps(left, right) >= 0
}

export function timestampIsLessThan(
  left: Timestamp,
  right: Timestamp,
): boolean {
  return compareTimestamps(left, right) === -1
}

export function timestampIsLessThanOrEqualTo(
  left: Timestamp,
  right: Timestamp,
): boolean {
  return compareTimestamps(left, right) <= 0
}

export function makeFloatTimestampFromUnwrapped(
  frames: number,
): FloatTimestamp {
  return (remEuclid(frames + Math.pow(2, 15), Math.pow(2, 16)) -
    Math.pow(2, 15)) as FloatTimestamp
}

export function makeFloatTimestampFromTime(
  time: number,
  unitTime: number,
): FloatTimestamp {
  return makeFloatTimestampFromUnwrapped(time / unitTime)
}

export function ceilFloatTimestamp(timestamp: FloatTimestamp): Timestamp {
  return makeTimestamp(Math.ceil(timestamp))
}

export function floorFloatTimestamp(timestamp: FloatTimestamp): Timestamp {
  return makeTimestamp(Math.floor(timestamp))
}

export function makeTimestamped<T>(
  timestamped: T | Timestamped<T>,
  timestamp: Timestamp,
): Timestamped<T> {
  ;(timestamped as Timestamped<T>).timestamp = timestamp
  return timestamped as Timestamped<T>
}

export function getTimestamp(timestamped: Timestamped<unknown>) {
  return timestamped.timestamp
}
