import {
  ComponentOf,
  createComponentFactory,
  createQuery,
  createWorld,
  number,
} from "@javelin/ecs"
import { app, framerate, graphics } from "./graphics"

enum Tags {
  Influenced = 1,
}

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

function render() {
  for (const [p] of world.query(junk)) {
    graphics.beginFill(
      world.storage.hasTag(p._e, Tags.Influenced) ? 0xee0000 : 0xeeeeee,
    )
    graphics.drawRect(p.x, p.y, 1, 1)
    graphics.endFill()
  }

  for (const [p, w] of world.query(wormholes)) {
    graphics.beginFill(0x000000)
    graphics.lineStyle(1, 0x333333, 1)
    graphics.drawCircle(p.x, p.y, calcWormholeHorizon(w as any))
    graphics.endFill()
  }
}

function attract() {
  // wormhole system
  for (const [jp, jv] of world.query(junk)) {
    for (const [wp, w] of world.query(wormholes)) {
      const dx = wp.x - jp.x
      const dy = wp.y - jp.y
      const len = Math.sqrt(dx * dx + dy * dy)

      if (len <= w.radius) {
        world.storage.addTag(jp._e, Tags.Influenced)
        if (len < calcWormholeHorizon(w as any)) {
          world.destroy(jp._e)
          w.radius += 0.1
        } else {
          const nx = dx / len
          const ny = dy / len

          jv.x += nx / 100
          jv.y += ny / 100
        }
      }
    }
  }
}

function physics() {
  // physics system
  for (const [p, v] of world.query(junk)) {
    p.x += v.x
    p.y += v.y
  }
}

const world = createWorld([render, attract, physics])

const junkCount = 15000
const calcWormholeHorizon = (w: ComponentOf<typeof Wormhole>) => w.radius / 10

for (let i = 0; i < junkCount; i++) {
  world.create([
    Position.create(Math.random() * 1680, Math.random() * 916),
    Velocity.create(),
  ])
}

const junk = createQuery(Position, Velocity)
const wormholes = createQuery(Position, Wormhole)

let tick = 0

function loop() {
  // render system
  graphics.clear()

  if (tick % 60 === 0) {
    framerate.text = `${app.ticker.FPS.toFixed(0)}`
  }

  tick++

  world.tick(0)

  requestAnimationFrame(loop)
}

let ix = 0
let iy = 0

function onPointerDown(event: any) {
  ix = event.data.global.x
  iy = event.data.global.y
}

app.renderer.plugins.interaction.on("pointerdown", onPointerDown)
app.renderer.plugins.interaction.on("pointerup", onClick)

function onClick(event: any) {
  const dx = event.data.global.x - ix
  const dy = event.data.global.y - iy
  const r = Math.sqrt(dx * dx + dy * dy) * 10

  world.create([Position.create(ix, iy), Wormhole.create(r)])
}

loop()
