import {suite, test, expect} from "vitest"
import * as Timestamp from "./timestamp.js"

export function makeTimestamps() {
  return [
    Timestamp.makeTimestamp(Timestamp.TIMESTAMP_MIN),
    Timestamp.makeTimestamp(Timestamp.TIMESTAMP_MIN / 2),
    Timestamp.makeTimestamp(-1),
    Timestamp.makeTimestamp(),
    Timestamp.makeTimestamp(1),
    Timestamp.makeTimestamp(Timestamp.TIMESTAMP_MAX / 2),
    Timestamp.makeTimestamp(Timestamp.TIMESTAMP_MAX),
  ]
}

function makeOffsets(initial: Timestamp.Timestamp) {
  const plusOne = Timestamp.addTimestamps(initial, 1)
  const plusLimit = Timestamp.addTimestamps(initial, Timestamp.TIMESTAMP_MAX)
  const plusWrapped = Timestamp.addTimestamps(plusLimit, 1)
  const plusWrappedLimit = Timestamp.subtractTimestamps(
    plusLimit,
    Timestamp.TIMESTAMP_MIN,
  )
  const plusWrappedFull = Timestamp.addTimestamps(plusWrappedLimit, 1)
  const minusOne = Timestamp.subtractTimestamps(initial, 1)
  const minusLimit = Timestamp.addTimestamps(initial, Timestamp.TIMESTAMP_MIN)
  const minusWrapped = Timestamp.subtractTimestamps(minusLimit, 1)
  const minusWrappedLimit = Timestamp.subtractTimestamps(
    minusLimit,
    Timestamp.TIMESTAMP_MAX,
  )
  const minusWrappedFull = Timestamp.subtractTimestamps(minusWrappedLimit, 1)
  return {
    plusOne,
    plusLimit,
    plusWrapped,
    plusWrappedLimit,
    plusWrappedFull,
    minusOne,
    minusLimit,
    minusWrapped,
    minusWrappedLimit,
    minusWrappedFull,
  }
}

suite("Timestamp", () => {
  test("order", () => {
    function testTimestampOrderWithInitial(initial: Timestamp.Timestamp) {
      const offsets = makeOffsets(initial)
      expect(Timestamp.compareTimestamps(offsets.plusOne, initial)).toBe(1)
      expect(Timestamp.compareTimestamps(offsets.plusLimit, initial)).toBe(1)
      expect(Timestamp.compareTimestamps(offsets.plusWrapped, initial)).toBe(-1)
      expect(
        Timestamp.compareTimestamps(offsets.plusWrappedLimit, initial),
      ).toBe(-1)
      expect(
        Timestamp.compareTimestamps(offsets.plusWrappedFull, initial),
      ).toBe(0)
      expect(Timestamp.compareTimestamps(offsets.minusOne, initial)).toBe(-1)
      expect(Timestamp.compareTimestamps(offsets.minusLimit, initial)).toBe(-1)
      expect(Timestamp.compareTimestamps(offsets.minusWrapped, initial)).toBe(1)
      expect(
        Timestamp.compareTimestamps(offsets.minusWrappedLimit, initial),
      ).toBe(1)
      expect(
        Timestamp.compareTimestamps(offsets.minusWrappedFull, initial),
      ).toBe(0)
    }

    for (const timestamp of makeTimestamps()) {
      testTimestampOrderWithInitial(timestamp)
    }
  })
  test("difference", () => {
    function testTimestampDifferenceWithInitial(initial: Timestamp.Timestamp) {
      const offsets = makeOffsets(initial)
      expect(Timestamp.subtractTimestamps(offsets.plusOne, initial)).toEqual(
        Timestamp.makeTimestamp(1),
      )
      expect(Timestamp.subtractTimestamps(offsets.plusLimit, initial)).toEqual(
        Timestamp.makeTimestamp(Timestamp.TIMESTAMP_MAX),
      )
      expect(
        Timestamp.subtractTimestamps(offsets.plusWrapped, initial),
      ).toEqual(Timestamp.makeTimestamp(Timestamp.TIMESTAMP_MIN))
      expect(
        Timestamp.subtractTimestamps(offsets.plusWrappedLimit, initial),
      ).toEqual(Timestamp.makeTimestamp(-1))
      expect(
        Timestamp.subtractTimestamps(offsets.plusWrappedFull, initial),
      ).toEqual(Timestamp.makeTimestamp())
      expect(Timestamp.subtractTimestamps(offsets.minusOne, initial)).toEqual(
        Timestamp.makeTimestamp(-1),
      )
      expect(Timestamp.subtractTimestamps(offsets.minusLimit, initial)).toEqual(
        Timestamp.makeTimestamp(Timestamp.TIMESTAMP_MIN),
      )
      expect(
        Timestamp.subtractTimestamps(offsets.minusWrapped, initial),
      ).toEqual(Timestamp.makeTimestamp(Timestamp.TIMESTAMP_MAX))
      expect(
        Timestamp.subtractTimestamps(offsets.minusWrappedLimit, initial),
      ).toEqual(Timestamp.makeTimestamp(1))
      expect(
        Timestamp.subtractTimestamps(offsets.minusWrappedFull, initial),
      ).toEqual(Timestamp.makeTimestamp())
    }

    for (const timestamp of makeTimestamps()) {
      testTimestampDifferenceWithInitial(timestamp)
    }
  })
  test("increment", () => {
    for (const timestamp of makeTimestamps()) {
      const incremented = Timestamp.incrementTimestamp(
        Timestamp.makeTimestamp(timestamp),
      )
      expect(Timestamp.compareTimestamps(incremented, timestamp)).toBe(1)
      expect(Timestamp.subtractTimestamps(incremented, timestamp)).toBe(
        Timestamp.makeTimestamp(1),
      )
    }
  })
  test("from time", () => {
    expect(Timestamp.makeTimestampFromTime(0, 1)).toEqual(
      Timestamp.makeTimestamp(),
    )
    expect(Timestamp.makeTimestampFromTime(1, 1)).toEqual(
      Timestamp.makeTimestamp(1),
    )
    expect(Timestamp.makeTimestampFromTime(0.25, 0.25)).toEqual(
      Timestamp.makeTimestamp(1),
    )
    expect(Timestamp.makeTimestampFromTime(-1, 1)).toEqual(
      Timestamp.makeTimestamp(-1),
    )
    expect(Timestamp.makeTimestampFromTime(Timestamp.TIMESTAMP_MAX, 1)).toEqual(
      Timestamp.TIMESTAMP_MAX,
    )
    expect(
      Timestamp.makeTimestampFromTime(Timestamp.TIMESTAMP_MAX + 1, 1),
    ).toEqual(Timestamp.TIMESTAMP_MIN)
    expect(Timestamp.makeTimestampFromTime(Timestamp.TIMESTAMP_MIN, 1)).toEqual(
      Timestamp.TIMESTAMP_MIN,
    )
    expect(
      Timestamp.makeTimestampFromTime(Timestamp.TIMESTAMP_MIN - 1, 1),
    ).toEqual(Timestamp.TIMESTAMP_MAX)
  })
  test("as time", () => {
    expect(
      Timestamp.timestampToTime(Timestamp.makeTimestampFromTime(0, 1), 1),
    ).toEqual(0)
    expect(
      Timestamp.timestampToTime(Timestamp.makeTimestampFromTime(1, 1), 1),
    ).toEqual(1)
    expect(
      Timestamp.timestampToTime(Timestamp.makeTimestampFromTime(1, 1), 0.25),
    ).toEqual(0.25)
    expect(
      Timestamp.timestampToTime(
        Timestamp.makeTimestampFromTime(0.25, 0.25),
        0.25,
      ),
    ).toEqual(0.25)
    expect(
      Timestamp.timestampToTime(Timestamp.makeTimestampFromTime(-1, 1), 1),
    ).toEqual(-1)
    expect(
      Timestamp.timestampToTime(
        Timestamp.makeTimestampFromTime(Timestamp.TIMESTAMP_MAX, 1),
        1,
      ),
    ).toEqual(Timestamp.TIMESTAMP_MAX)
    expect(
      Timestamp.timestampToTime(
        Timestamp.makeTimestampFromTime(Timestamp.TIMESTAMP_MAX + 1, 1),
        1,
      ),
    ).toEqual(Timestamp.TIMESTAMP_MIN)
    expect(
      Timestamp.timestampToTime(
        Timestamp.makeTimestampFromTime(Timestamp.TIMESTAMP_MIN, 1),
        1,
      ),
    ).toEqual(Timestamp.TIMESTAMP_MIN)
    expect(
      Timestamp.timestampToTime(
        Timestamp.makeTimestampFromTime(Timestamp.TIMESTAMP_MIN - 1, 1),
        1,
      ),
    ).toEqual(Timestamp.TIMESTAMP_MAX)
  })
})
