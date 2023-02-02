import {expect, test} from "vitest"
import {TimestampBuffer} from "./timestamp_buffer.js"
import {
  makeTimestamp,
  TIMESTAMP_MAX,
  addTimestamps,
  calcTimestampRangeMax,
  subtractTimestamps,
  calcTimestampRangeMin,
} from "./timestamp.js"

test("insert single command", () => {
  let t = makeTimestamp()
  let command = {}
  let buffer = new TimestampBuffer()
  buffer.insert(command, t, t)
  expect(buffer.length).toBe(1)
})

test("insert multiple commands at different timestamps", () => {
  let t0 = makeTimestamp()
  let t1 = makeTimestamp(1)
  let t2 = makeTimestamp(2)
  let c0 = {}
  let c1 = {}
  let c2 = {}
  let buffer = new TimestampBuffer()
  buffer.insert(c0, t0, t0)
  buffer.insert(c1, t1, t0)
  buffer.insert(c2, t2, t0)
  expect(buffer.length).toBe(3)
  expect(buffer.at(t0)!.length).toBe(1)
})

test("insert multiple commands at same timestamp", () => {
  let t = makeTimestamp()
  let command = {}
  let buffer = new TimestampBuffer()
  buffer.insert(command, t, t)
  buffer.insert(command, t, t)
  buffer.insert(command, t, t)
  expect(buffer.length).toBe(1)
  expect(buffer.at(t)?.length).toBe(3)
})

test("insert command at invalid timestamp", () => {
  let midpoint = makeTimestamp()
  let t = makeTimestamp(TIMESTAMP_MAX)
  let command = {}
  let buffer = new TimestampBuffer()
  buffer.insert(command, t, midpoint)
  expect(buffer.length).toBe(0)
})

test("prune w/ no stale commands", () => {
  let t0 = makeTimestamp()
  let t1 = makeTimestamp(calcTimestampRangeMax(t0))
  let command = {}
  let buffer = new TimestampBuffer()
  buffer.insert(command, t0, t0)
  buffer.prune(t1)
  expect(buffer.length).toBe(1)
})

test("prune w/ stale commands before", () => {
  let t0 = makeTimestamp()
  let t1 = makeTimestamp(addTimestamps(calcTimestampRangeMax(t0), 1))
  let command = {}
  let buffer = new TimestampBuffer()
  buffer.insert(command, t0, t0)
  buffer.prune(t1)
  expect(buffer.length).toBe(0)
})

test("prune w/ stale commands after", () => {
  let t0 = makeTimestamp()
  let t1 = makeTimestamp(subtractTimestamps(calcTimestampRangeMin(t0), 1))
  let command = {}
  let buffer = new TimestampBuffer()
  buffer.insert(command, t0, t0)
  buffer.prune(t1)
  expect(buffer.length).toBe(0)
})

test("drain all", () => {
  let t0 = makeTimestamp()
  let t1 = makeTimestamp(1)
  let t2 = makeTimestamp(2)
  let c0 = {}
  let c1 = {}
  let c2 = {}
  let buffer = new TimestampBuffer<{}>()
  buffer.insert(c0, t0, t0)
  buffer.insert(c1, t1, t0)
  buffer.insert(c2, t2, t0)
  buffer.insert(c2, t2, t0)
  let commands: {}[] = []
  buffer.drainAll(command => commands.push(command))
  expect(commands.length).toBe(4)
  expect(buffer.length).toBe(0)
})
