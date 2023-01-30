import {expect, test} from "vitest"
import {FixedTimestepImpl, TerminationCondition} from "./fixed_timestep"

type CartesianProduct<T> = {
  [K in keyof T]: T[K] extends (infer _)[] ? _ : never
}[]

let cartesianProduct = <T extends unknown[][]>(
  ...arr: T
): CartesianProduct<T> => {
  return arr.reduce((arr, b) =>
    arr.flatMap(d => b.map(e => [d, e].flat())),
  ) as CartesianProduct<T>
}

let TIME_STEP = 1 / 60

function testTermination(
  terminationCondition: TerminationCondition,
  frames = 1,
) {
  let timestep = new FixedTimestepImpl({
    timeStep: TIME_STEP,
    maxUpdateDelta: 0.25,
    timeSkipThreshold: 1 / 60,
    terminationCondition,
  })
  timestep.update(TIME_STEP * frames, TIME_STEP * frames)
  return timestep.steps
}

test("LastUndershoot exact", () => {
  let result = testTermination(TerminationCondition.LastUndershoot)
  expect(result).toBe(1)
})

test("LastUndershoot below", () => {
  let result = testTermination(TerminationCondition.LastUndershoot, 0.5)
  expect(result).toBe(0)
})

test("LastUndershoot above", () => {
  let result = testTermination(TerminationCondition.LastUndershoot, 1.5)
  expect(result).toBe(1)
})

test("FirstOvershoot exact", () => {
  let result = testTermination(TerminationCondition.FirstOvershoot)
  expect(result).toBe(1)
})

test("FirstOvershoot below", () => {
  let result = testTermination(TerminationCondition.FirstOvershoot, 0.5)
  expect(result).toBe(1)
})

test("FirstOvershoot above", () => {
  let result = testTermination(TerminationCondition.FirstOvershoot, 1.5)
  expect(result).toBe(2)
})

let interestingTimes = [
  TIME_STEP,
  -TIME_STEP,
  TIME_STEP * 2,
  -TIME_STEP * 2,
  TIME_STEP * 100,
  -TIME_STEP * 100,
]

let interestingFramesPerUpdate = [1, 1.7, 0.5, 2.5, 2]
let defaultConfig = {
  timeStep: TIME_STEP,
  maxUpdateDelta: 0.25,
  timeSkipThreshold: 1,
  terminationCondition: TerminationCondition.FirstOvershoot,
}

let update = (
  timestep: FixedTimestepImpl,
  frames: number,
  time: number,
  drift: number,
) => {
  let deltaTime = TIME_STEP * frames
  let targetTime = time + deltaTime - drift
  timestep.update(deltaTime, targetTime)
  return targetTime
}

test("ignores drift when timestep drifts within the frame", () => {
  let drifts = [
    0,
    TIME_STEP * 0.001,
    -TIME_STEP * 0.001,
    TIME_STEP * 0.499,
    -TIME_STEP * 0.499,
  ]
  for (let [drift, time, frames] of cartesianProduct(
    drifts,
    interestingTimes,
    interestingFramesPerUpdate,
  )) {
    let timestep = new FixedTimestepImpl(defaultConfig)
    timestep.reset(time)
    expect(timestep.measureDrift(time)).toBeCloseTo(0)
    expect(timestep.measureDrift(time - drift)).toBeCloseTo(drift)

    let targetTime = update(timestep, frames, time, drift)
    expect(timestep.measureDrift(targetTime)).toBeCloseTo(drift)
    expect(timestep.steps).toEqual(Math.ceil(frames))
  }
})

test("corrects timestamp when timestep drifts beyond a frame", () => {
  let drifts = [TIME_STEP * 0.5, -TIME_STEP * 0.5]
  for (let [drift, time, frames] of cartesianProduct(
    drifts,
    interestingTimes,
    interestingFramesPerUpdate,
  )) {
    let timestep = new FixedTimestepImpl(defaultConfig)
    timestep.reset(time)
    expect(timestep.measureDrift(time)).toBeCloseTo(0)
    expect(timestep.measureDrift(time - drift)).toBeCloseTo(drift)

    let targetTime = update(timestep, frames, time, drift)
    expect(timestep.measureDrift(targetTime)).toBeCloseTo(0)
    expect(timestep.steps).toEqual(
      Math.round((timestep.currentTime - time) / TIME_STEP),
    )
  }
})

test("skips timestamps when drift is beyond threshold", () => {
  let timeSkipThreshold = 1
  let maxUpdateDelta = 0.25
  let maxSkipDelta = timeSkipThreshold + maxUpdateDelta
  let drifts = [
    maxSkipDelta,
    -maxSkipDelta,
    maxSkipDelta * 2,
    -maxSkipDelta * 2,
  ]
  for (let [drift, time, frames] of cartesianProduct(
    drifts,
    interestingTimes,
    interestingFramesPerUpdate,
  )) {
    let expectedStepCount =
      drift >= 0 ? 0 : Math.ceil(maxUpdateDelta / TIME_STEP) + 1
    let timestep = new FixedTimestepImpl({
      timeStep: TIME_STEP,
      maxUpdateDelta,
      timeSkipThreshold,
      terminationCondition: TerminationCondition.FirstOvershoot,
    })
    timestep.reset(time)
    expect(timestep.measureDrift(time)).toBeCloseTo(0)

    let targetTime = update(timestep, frames, time, drift)
    expect(timestep.measureDrift(targetTime)).toBeCloseTo(0)
    expect(timestep.steps).toBe(expectedStepCount)
  }
})

test("should not drift while delta is changing", () => {
  for (let time of interestingTimes) {
    let timestep = new FixedTimestepImpl(defaultConfig)
    timestep.reset(time)
    expect(timestep.measureDrift(time)).toBeCloseTo(0)
    for (let frames of interestingFramesPerUpdate) {
      let delta = TIME_STEP * frames
      time += delta
      timestep.update(delta, time)
      expect(timestep.measureDrift(time)).toBeCloseTo(0)
    }
  }
})
