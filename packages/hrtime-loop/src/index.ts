export type Clock = {
  now: bigint
  dt: number
  tick: number
}

export const NS_PER_MS = BigInt(1e6)

enum LoopState {
  Stopped,
  Running,
}

/**
 * This loop uses the fairly performant setImmediate scheduler in conjunction
 * with the lower-resolution setTimeout to maintain high precision and
 * performance.
 *
 * @param rate Target duration of each tick in milliseconds, e.g. 16.666666
 * @param callback Function to execute each tick
 */
export const createHrtimeLoop = (
  rate: number,
  callback: (clock: Clock) => unknown,
) => {
  const nsPerTick = BigInt(Math.floor(rate * Number(NS_PER_MS)))
  const clock: Clock = {
    now: BigInt(0),
    dt: 0,
    tick: -1,
  }
  let remaining = nsPerTick
  let previous: bigint = BigInt(0)
  let state = LoopState.Stopped

  const start = () => {
    if (state === LoopState.Running) return

    state = LoopState.Running
    loop()
  }
  const stop = () => state === LoopState.Stopped
  const loop = () => {
    if (state === LoopState.Stopped) return

    const time = process.hrtime.bigint()
    const diff = time - (previous || time)

    remaining -= diff

    if (remaining <= 0) {
      clock.dt = Number((remaining + nsPerTick) / NS_PER_MS)
      clock.now = time / NS_PER_MS
      clock.tick = clock.tick + 1

      callback(clock)
      setImmediate(loop)
      remaining = nsPerTick
    } else if (remaining < Number(nsPerTick) / 8) {
      setImmediate(loop)
    } else {
      setTimeout(loop, Number(remaining / NS_PER_MS))
    }

    previous = time
  }

  return {
    start,
    stop,
  }
}
