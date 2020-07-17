const { createHrtimeLoop } = require("../dist")

const interval = (1 / 60) * 1000
const ticks = 1000
const samples = []

function tick(clock) {
  samples.push({ ...clock })

  if (samples.length >= ticks) {
    loop.stop()
    printResults()
  }
}

function printResults() {
  const avgTick = samples.reduce((a, s) => a + s.dt, 0) / samples.length
  const stdDeviation =
    samples.reduce((a, s) => avgTick - s.dt, 0) / samples.length

  console.log(`tick_interval | ${interval}`)
  console.log(`ticks         | ${ticks}`)
  console.log(`avg_tick      | ${avgTick}`)
  console.log(
    `accuracy      | ${(Math.abs(interval / avgTick) * 100).toFixed(3)}%`,
  )
  console.log(
    `precision     | ${((1 - stdDeviation / avgTick) * 100).toFixed(3)}%`,
  )
}

const loop = createHrtimeLoop(interval, tick)

loop.start()
