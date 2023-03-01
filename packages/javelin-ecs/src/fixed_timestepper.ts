export enum TerminationCondition {
  /**
   * Configures a `FixedTimestep` to stop on or just before the target time.
   */
  LastUndershoot,
  /**
   * Configures a `FixedTimestep` to stop on or just after the target time.
   */
  FirstOvershoot,
}

export type FixedTimestepperConfig = {
  /**
   * Due to floating-point rounding errors, and the `maxUpdateDelta` limit, the
   * `FixedTimestep` might slowly drift away from the target time. `FixedTimestep`
   * compensates for small amounts of drift by calculating fewer or more steps than
   * usual. If the discepancy becomes too large, `FixedTimestep` will perform a
   * "time-skip" without publishing the corresponding steps. This option defines the
   * threshold for drift before a time-skip occurs.
   */
  maxDrift: number

  /**
   * The maximum time to step forward in a single call to `FixedTimestep#update`. This
   * option exists to avoid freezing the process when the `FixedTimestep`'s current time
   * drifts too far from the target time.
   */
  maxUpdateDelta: number

  /**
   * Decides whether to keep the current time slightly over or behind the target time.
   */
  terminationCondition: TerminationCondition

  /**
   * The number of seconds that should make up a single fixed step on any
   * machine.
   */
  timeStep: number
}

let roundUpTo = (x: number, t: number) => Math.ceil(x / t) * t
let roundDownTo = (x: number, t: number) => Math.floor(x / t) * t

export class FixedTimestepper {
  #currentTime
  #currentOvershootTime
  #lastSkipTime
  #step
  #steps
  readonly #maxDrift
  readonly #maxUpdateDelta
  readonly #terminationCondition
  readonly #timeStep

  constructor(config: FixedTimestepperConfig) {
    this.#currentTime = 0
    this.#lastSkipTime = 0
    this.#currentOvershootTime = 0
    this.#step = 0
    this.#steps = 0
    this.#timeStep = config.timeStep
    this.#terminationCondition = config.terminationCondition
    this.#maxDrift = config.maxDrift
    this.#maxUpdateDelta = config.maxUpdateDelta
  }

  #shouldTerminate(lastOvershootTime: number) {
    switch (this.#terminationCondition) {
      case TerminationCondition.LastUndershoot:
        return lastOvershootTime > 0
      case TerminationCondition.FirstOvershoot:
        return this.#currentOvershootTime >= 0
    }
  }

  #advance(deltaTime: number) {
    let steps = 0
    this.#currentOvershootTime -= deltaTime
    while (true) {
      let nextOvershootTime = this.#currentOvershootTime + this.#timeStep
      if (this.#shouldTerminate(nextOvershootTime)) {
        break
      }
      this.#currentOvershootTime = nextOvershootTime
      this.#currentTime += this.#timeStep
      steps++
    }
    this.#steps = steps
    this.#step += steps
  }

  measureDrift(targetTime: number) {
    return this.#currentTime - this.#currentOvershootTime - targetTime
  }

  #compensateDeltaTime(deltaTime: number, targetTime: number) {
    let drift = this.measureDrift(targetTime - deltaTime)
    if (Math.abs(drift) - this.#timeStep * 0.5 < -Number.EPSILON) {
      drift = 0
    }
    let compensatedDeltaTimeUncapped = Math.max(deltaTime - drift, 0)
    let compensatedDeltaTime =
      compensatedDeltaTimeUncapped > this.#maxUpdateDelta
        ? this.#maxUpdateDelta
        : compensatedDeltaTimeUncapped
    return compensatedDeltaTime
  }

  advance(deltaTime: number, targetTime: number) {
    let compensatedDeltaTime = this.#compensateDeltaTime(deltaTime, targetTime)
    let steps = this.#advance(compensatedDeltaTime)
    // Skip time if necessary.
    let drift = this.measureDrift(targetTime)
    if (Math.abs(drift) >= this.#maxDrift) {
      this.reset(targetTime)
      this.#lastSkipTime = this.#currentTime
    }
    return steps
  }

  reset(targetTime: number) {
    let targetDecomposedTime = 0
    switch (this.#terminationCondition) {
      case TerminationCondition.FirstOvershoot:
        targetDecomposedTime = roundUpTo(targetTime, this.#timeStep)
        break
      case TerminationCondition.LastUndershoot:
        targetDecomposedTime = roundDownTo(targetTime, this.#timeStep)
        break
    }
    this.#currentTime = targetDecomposedTime
    this.#currentOvershootTime = targetDecomposedTime - targetTime
    this.#step = targetDecomposedTime / this.#timeStep
  }

  get currentStep() {
    return this.#step
  }

  get steps() {
    return this.#steps
  }

  get timeStep() {
    return this.#timeStep
  }

  get currentTime() {
    return this.#currentTime
  }

  get lastOvershootTime() {
    return this.#currentOvershootTime
  }

  lastAdvanceResultedInTimeskip() {
    return this.#lastSkipTime === this.#currentTime
  }
}
