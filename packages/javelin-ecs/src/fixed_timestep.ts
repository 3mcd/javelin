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

export type FixedTimestepConfig = {
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
   * Due to floating-point rounding errors, and the `maxUpdateDelta` limit, the
   * `FixedTimestep` might slowly drift away from the target time. `FixedTimestep`
   * compensates for small amounts of drift by calculating fewer or more steps than
   * usual. If the discepancy becomes too large, `FixedTimestep` will perform a
   * "time-skip" without publishing the corresponding steps. This option defines the
   * threshold for drift before a time-skip occurs.
   */
  timeSkipThreshold: number

  /**
   * The number of seconds that should make up a single fixed step on any
   * machine.
   */
  timeStep: number
}

let roundUpTo = (x: number, t: number) => Math.ceil(x / t) * t
let roundDownTo = (x: number, t: number) => Math.floor(x / t) * t

export class FixedTimestepImpl {
  #currentTime
  #lastSkipTime
  #lastOvershootTime
  #steps
  readonly #maxUpdateDelta
  readonly #terminationCondition
  readonly #timeSkipThreshold
  readonly #timeStep

  constructor(config: FixedTimestepConfig) {
    this.#currentTime = 0
    this.#lastSkipTime = 0
    this.#lastOvershootTime = 0
    this.#steps = 0
    this.#timeStep = config.timeStep
    this.#terminationCondition = config.terminationCondition
    this.#timeSkipThreshold = config.timeSkipThreshold
    this.#maxUpdateDelta = config.maxUpdateDelta
  }

  #shouldTerminate(lastOvershootTime: number) {
    switch (this.#terminationCondition) {
      case TerminationCondition.LastUndershoot:
        return lastOvershootTime > 0
      case TerminationCondition.FirstOvershoot:
        return this.#lastOvershootTime >= 0
    }
  }

  #advance(deltaTime: number) {
    let steps = 0
    this.#lastOvershootTime -= deltaTime
    while (true) {
      let nextOvershootTime = this.#lastOvershootTime + this.#timeStep
      if (this.#shouldTerminate(nextOvershootTime)) {
        break
      }
      this.#lastOvershootTime = nextOvershootTime
      this.#currentTime += this.#timeStep
      steps++
    }
    this.#steps = steps
  }

  measureDrift(targetTime: number) {
    return this.#currentTime - this.#lastOvershootTime - targetTime
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

  update(deltaTime: number, targetTime: number) {
    let compensatedDeltaTime = this.#compensateDeltaTime(deltaTime, targetTime)
    let steps = this.#advance(compensatedDeltaTime)
    // Skip time if necessary.
    let drift = this.measureDrift(targetTime)
    if (Math.abs(drift) >= this.#timeSkipThreshold) {
      this.reset(targetTime)
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
    this.#lastOvershootTime = targetDecomposedTime - targetTime
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
    return this.#lastOvershootTime
  }

  get lastSkipTime() {
    return this.#lastSkipTime
  }
}
