export type Clock = {
  now: number
  dt: number
  tick: number
}

const getHrTimeMs = () => {
  const hrTime = process.hrtime()
  return hrTime[0] * 1000 + hrTime[1] / 1000000
}

export function createHrtimeLoop(
  tickRate: number,
  callback: (clock: { dt: number }) => void,
) {
  const clock: Clock = { dt: 0, now: 0, tick: 0 }

  let running = false
  let previousTick = getHrTimeMs()

  function loop() {
    if (!running) {
      return
    }

    const now = getHrTimeMs()

    if (previousTick + tickRate <= now) {
      const delta = now - previousTick

      previousTick = now

      clock.dt = delta
      clock.now = now
      clock.tick += 1

      callback(clock)
    }

    if (now - previousTick < tickRate - 16) {
      setTimeout(loop)
    } else {
      setImmediate(loop)
    }
  }

  function start() {
    running = true
    loop()
  }

  function stop() {
    running = false
  }

  return { start, stop }
}
