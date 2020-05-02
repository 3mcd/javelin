import {
  ComponentOf,
  createComponentFactory,
  mut,
  number,
  Query,
  Storage,
} from "@javelin/ecs"
import { graphics, framerate, app } from "./graphics"

enum Tags {
  Junk = 1,
  Wormhole = 2,
  Influenced = 4,
}

const storage = new Storage()
const Position = createComponentFactory(
  {
    type: 1,
    schema: {
      x: number,
      y: number,
    },
  },
  (c, x = 0, y = 0) => {
    c.x = x
    c.y = y
  },
)
const Velocity = createComponentFactory({
  type: 2,
  schema: {
    x: number,
    y: number,
  },
})
const Wormhole = createComponentFactory(
  {
    type: 3,
    schema: {
      radius: number,
    },
  },
  (c, r = 0) => (c.radius = r),
)

const junkCount = 10000
const wormholeCount = 10
const calcWormholeHorizon = (w: ComponentOf<typeof Wormhole>) => w.radius / 10

for (let i = 0; i < junkCount; i++) {
  storage.insert(
    i,
    [
      Position.create(Math.random() * 800, Math.random() * 600),
      Velocity.create(),
    ],
    Tags.Junk,
  )
}

for (let i = 0; i < wormholeCount; i++) {
  storage.insert(junkCount + i, [
    Position.create(Math.random() * 800, Math.random() * 600),
    Wormhole.create(20),
  ])
}

const junk = new Query([Position, Velocity]).filter(Tags.Junk)
const wormholes = new Query([Position, Wormhole])

let toRemove = new Set<number>()
let tick = 0

function loop() {
  // render system
  graphics.clear()

  if (tick % 60 === 0) {
    framerate.text = `${app.ticker.FPS.toFixed(0)}`
  }

  for (const [p] of junk.run(storage)) {
    graphics.beginFill(
      storage.hasTag(p._e, Tags.Influenced) ? 0xff0000 : 0x333333,
    )
    graphics.drawRect(p.x, p.y, 2, 2)
    graphics.endFill()
  }

  for (const [p, w] of wormholes.run(storage)) {
    graphics.beginFill(0x000000)
    graphics.lineStyle(1, 0x333333, 1)
    graphics.drawCircle(p.x, p.y, calcWormholeHorizon(w as any))
    graphics.endFill()
  }

  // wormhole system
  for (const [jp, jv] of junk.run(storage)) {
    for (const [wp, w] of wormholes.run(storage)) {
      const dx = wp.x - jp.x
      const dy = wp.y - jp.y
      const len = Math.sqrt(dx * dx + dy * dy)

      if (len <= w.radius) {
        storage.addTag(jp._e, Tags.Influenced)
        if (len < calcWormholeHorizon(w as any)) {
          toRemove.add(jp._e)
          mut(w, storage).radius += 0.5
        } else {
          const nx = dx / len
          const ny = dy / len
          const mjv = mut(jv, storage)
          mjv.x += nx / 100
          mjv.y += ny / 100
        }
      }
    }
  }

  // physics system
  for (const [p, v] of junk.run(storage)) {
    const mp = mut(p, storage)
    mp.x += v.x
    mp.y += v.y
  }

  toRemove.forEach(e => storage.remove(e))
  toRemove.clear()

  tick++

  requestAnimationFrame(loop)
}

loop()
