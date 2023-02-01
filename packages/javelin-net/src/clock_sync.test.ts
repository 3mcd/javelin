import {expect, test} from "vitest"
import {ClockSyncImpl} from "./clock_sync.js"

test("initial offset", () => {
  let clockDesync = 9
  let clockSyncSamples = new ClockSyncImpl({
    expectedOutlierRate: 0.2,
    maxDeviation: 1,
    requiredSampleCount: 4,
  })
  let offset = 0
  for (let i = 0; i < clockSyncSamples.getRequiredSampleCount(); i++) {
    offset = clockSyncSamples.addSample(clockDesync)
  }
  expect(offset).toBe(clockDesync)
  expect(offset).toBe(clockSyncSamples.getMeanOffset())
})

test("tolerated desync", () => {
  let maxTolerableDeviation = 0.25
  let clockDesync = 0.5
  let clockSyncSamples = new ClockSyncImpl({
    expectedOutlierRate: 0.2,
    maxDeviation: maxTolerableDeviation,
    requiredSampleCount: 5,
  })
  let offset = 0
  for (let i = 0; i < clockSyncSamples.getRequiredSampleCount(); i++) {
    offset = clockSyncSamples.addSample(clockDesync)
  }
  for (let i = 0; i < clockSyncSamples.getRequiredSampleCount(); i++) {
    offset = clockSyncSamples.addSample(clockDesync + maxTolerableDeviation)
  }
  expect(offset).toBe(clockDesync)
  expect(offset).toBe(clockSyncSamples.getMeanOffset())
})

test("untolerated desync", () => {
  let maxTolerableDeviation = 0.2
  let clockDesync = 0.5
  let clockSyncSamples = new ClockSyncImpl({
    expectedOutlierRate: 0.2,
    maxDeviation: maxTolerableDeviation,
    requiredSampleCount: 5,
  })
  let offset = 0
  for (let i = 0; i < clockSyncSamples.getRequiredSampleCount(); i++) {
    offset = clockSyncSamples.addSample(clockDesync)
  }
  for (let i = 0; i < clockSyncSamples.getRequiredSampleCount(); i++) {
    offset = clockSyncSamples.addSample(
      clockDesync + maxTolerableDeviation + Number.EPSILON,
    )
  }
  expect(offset).toBeGreaterThan(clockDesync)
})

test("outlier exclusion", () => {
  let maxTolerableDeviation = 0.01
  let requiredSampleCount = 10
  let clockDesync = 1
  let clockSyncSamples = new ClockSyncImpl({
    expectedOutlierRate: 0.5,
    maxDeviation: maxTolerableDeviation,
    requiredSampleCount,
  })
  let offset = 0
  for (let i = 0; i < clockSyncSamples.getRequiredSampleCount(); i++) {
    offset = clockSyncSamples.addSample(clockDesync)
  }
  for (let i = 0; i < requiredSampleCount; i++) {
    offset = clockSyncSamples.addSample(
      clockDesync + maxTolerableDeviation + Number.EPSILON,
    )
  }
  expect(offset).toBe(clockDesync)
  expect(offset).toBe(clockSyncSamples.getMeanOffset())
})

test("outlier inclusion (desync)", () => {
  let maxTolerableDeviation = 0.01
  let clockDesync = 1
  let clockSyncSamples = new ClockSyncImpl({
    requiredSampleCount: 10,
    expectedOutlierRate: 0.5,
    maxDeviation: maxTolerableDeviation,
  })
  let offset = 0
  for (let i = 0; i < clockSyncSamples.getRequiredSampleCount(); i++) {
    offset = clockSyncSamples.addSample(clockDesync)
  }
  for (let i = 0; i < clockSyncSamples.getRequiredSampleCount() + 1; i++) {
    offset = clockSyncSamples.addSample(
      clockDesync + maxTolerableDeviation + Number.EPSILON,
    )
  }
  expect(offset).toBeGreaterThan(clockDesync)
})
