import {
  createComponentFactory,
  mut,
  number,
  Query,
  Storage,
} from "@javelin/ecs"
import { graphics } from "./graphics"

const Position = createComponentFactory({
  type: 1,
  schema: {
    x: number,
    y: number,
  },
})
const Velocity = createComponentFactory(
  {
    type: 2,
    schema: {
      x: number,
      y: number,
    },
  },
  (v, x = 0, y = 0) => {
    v.x = x
    v.y = y
  },
)

const storage = new Storage()

enum Tags {
  Awake = 1,
}

for (let i = 0; i < 100000; i++) {
  const vx = Math.random() * 50
  const vy = Math.random() * 50

  storage.insert(i, [Position.create(), Velocity.create(vx, vy)], Tags.Awake)
}

const bodies = new Query([Position, Velocity])
const positions = new Query([Position])

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

function loop() {
  // physics system
  for (const [p, v] of bodies.run(storage)) {
    const mv = mut(v, storage)
    const mp = mut(p, storage)

    mp.x += v.x
    mp.y += v.y

    if (p.y >= floorOffset) {
      // collision w/ floor and "restitution"
      mv.y = -(v.y * 0.5)
      mv.x *= 0.5
      mp.y = floorOffset
      continue
    }

    if (p.x >= 800 || p.x <= 0) {
      // collision w/ wall and "restitution"
      mv.x = -(v.x * 0.5)
      mp.x = Math.max(0, Math.min(p.x, 800))
      continue
    }

    // gravity
    mv.y += 0.1
  }

  // render system
  graphics.clear()

  for (const [p] of positions.run(storage)) {
    graphics.beginFill(0x00ff00)
    graphics.drawRect(p.x, p.y, 2, 2)
    graphics.endFill()
  }

  requestAnimationFrame(loop)
}

loop()
