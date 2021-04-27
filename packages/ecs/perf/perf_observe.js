const {
  createWorld,
  createQuery,
  component,
  effObserve,
  number,
  arrayOf,
} = require("../dist/cjs")
const { performance } = require("perf_hooks")

const Player = {
  x: number,
  y: number,
  inventory: arrayOf(number),
}

const qryPlayers = createQuery(Player)
const sysObserve = () => {
  const { track, trackPop, trackPush } = effObserve()
  qryPlayers((e, [p]) => {
    p.x += 1
    p.y += 1
    track(p, "x", (p.x += 1))
    track(p, "y", (p.y += 1))
    p.inventory.push(1)
    trackPush(p, "inventory", 1)
    p.inventory.pop()
    trackPop(p, "inventory")
  })
}

const world = createWorld({
  systems: [sysObserve],
})

module.exports.run = () => {
  let n = 25_000
  let t = 100
  let i = 0

  for (let i = 0; i < n; i++) {
    world.spawn(component(Player))
  }

  let start
  let end
  let startInit = performance.now()
  let endInit

  console.log(
    `tracking ${(4 * n).toLocaleString()} changes per tick for ${t} ticks`,
  )

  while (i++ < t) {
    if (i === 2) {
      start = performance.now()
    }
    world.tick()
    if (i === 1) {
      endInit = performance.now()
    }
  }

  end = performance.now()

  console.log(`tick_count    | ${t}`)
  console.log(`tick_time_avg | ${(end - start) / t}ms`)
  console.log(`init_time     | ${endInit - startInit}ms`)
}
