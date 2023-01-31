import {ClockSyncPayload} from "./components.js"
import {ProtocolMessageType} from "./protocol.js"
import {SortedRingBuffer} from "./structs/sorted_ring_buffer.js"

export type ClockSyncConfig = {
  /**
   * The expected frequency of abnormal clock sync samples. Used to discard
   * outliers when calculating the mean clock offset. A percentage measured as
   * a value between 0 and 1.
   */
  expectedOutlierRate: number
  /**
   * The maximum difference between the current offset and the next offset in (
   * calculated when a new sample is added) before the client and server are
   * considered out of sync.
   */
  maxTolerableDeviation: number
  /**
   * The required number of samples to await before calculating the first mean
   * clock offset.
   */
  requiredSampleCount: number
}

/**
 * Compute the number of samples to ignore at the left and right extremes of a
 * `ClockSync` sample queue.
 *
 * @example <caption>`samplesToDiscardPerExtreme=2`</caption>
 * ```ts
 * // Values in parenthesis are considered:
 * [0.1, 0.3, (0.333, 0.334, 0.334, 0.34, 0.341, 0.35), 0.7, 1.9]
 * ```
 */
function calcSamplesToDiscardPerExtreme(
  requiredSampleCount: number,
  expectedOutlierRate: number,
) {
  return Math.ceil(Math.max((requiredSampleCount * expectedOutlierRate) / 2, 1))
}

function has_desynced(
  prevOffset: number,
  meanOffset: number,
  maxTolerableDeviation: number,
) {
  return Math.abs(meanOffset - prevOffset) > maxTolerableDeviation
}

/**
 * A queue of client-server offset samples used to continuously compute the
 * mean offset between a client and server clock.
 */
export class ClockSyncImpl {
  #maxTolerableDeviation
  #meanOffset
  #requiredSampleCount
  #sampleQueue
  #samplesToDiscardPerExtreme

  constructor(config: ClockSyncConfig) {
    let samplesToDiscardPerExtreme = calcSamplesToDiscardPerExtreme(
      config.requiredSampleCount,
      config.expectedOutlierRate,
    )
    this.#meanOffset = Infinity
    this.#maxTolerableDeviation = config.maxTolerableDeviation
    this.#requiredSampleCount =
      config.requiredSampleCount + samplesToDiscardPerExtreme * 2
    this.#samplesToDiscardPerExtreme = samplesToDiscardPerExtreme
    this.#sampleQueue = new SortedRingBuffer<number>(this.#requiredSampleCount)
  }

  #calcRollingMeanOffset() {
    let end = this.#sampleQueue.length - this.#samplesToDiscardPerExtreme
    let totalOffset = 0
    for (let i = this.#samplesToDiscardPerExtreme; i < end; i++) {
      totalOffset += this.#sampleQueue.at(i)!
    }
    return totalOffset / (end - this.#samplesToDiscardPerExtreme)
  }

  /**
   * Add an offset sample to the `ClockSync` sample queue. `addSample` returns
   * a new offset if the `ClockSync` has enough samples to compute an offset
   * and no previous offset was provided or the clocks have desynced.
   * A return value of `Infinity` indicates that there are not enough samples
   * in the queue to calculate the offset.
   */
  addSample(sample: number): number {
    this.#sampleQueue.push(sample, sample)
    if (this.#sampleQueue.length === this.#requiredSampleCount) {
      let nextMeanOffset = this.#calcRollingMeanOffset()
      // Update the mean offset if one hasn't been calculated yet, or the
      // clocks have desynced substantially.
      if (
        this.isNew() ||
        has_desynced(
          this.#meanOffset,
          nextMeanOffset,
          this.#maxTolerableDeviation,
        )
      ) {
        return (this.#meanOffset = nextMeanOffset)
      }
    }
    return this.#meanOffset
  }

  isNew() {
    return this.#meanOffset === Infinity
  }

  getRequiredSampleCount() {
    return this.#requiredSampleCount
  }

  getMeanOffset() {
    return this.#meanOffset
  }
}

export let clockSyncMessageType: ProtocolMessageType<ClockSyncPayload> = {
  encode(writeStream, _, clockSyncPayload) {
    writeStream.grow(16)
    writeStream.writeF64(clockSyncPayload.clientTime)
    writeStream.writeF64(clockSyncPayload.serverTime)
  },
  decode(readStream, world, entity) {
    world.set(entity, ClockSyncPayload, {
      clientTime: readStream.readF64(),
      serverTime: readStream.readF64(),
    })
  },
}
