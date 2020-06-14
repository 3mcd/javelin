export type Clock = {
  now: number
  dt: number
  tick: number
}

export function createHrtimeLoop(
  tickRate: number,
  callback: (clock: { dt: number }) => void,
) {
  const clock: Clock = { dt: 0, now: 0, tick: 0 }

  let running = false
  let previousTick = Date.now()

  function loop() {
    if (!running) {
      return
    }

    const now = Date.now()

    if (previousTick + tickRate <= now) {
      const delta = 1000 / (now - previousTick)

      previousTick = now

      clock.dt = delta
      clock.now = now
      clock.tick += 1

      callback(clock)
    }

    if (Date.now() - previousTick < tickRate - 16) {
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
