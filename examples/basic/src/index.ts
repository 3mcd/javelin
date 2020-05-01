import {
  createComponentFactory,
  isComponentOf,
  number,
  Query,
  Storage,
  Component,
  Filter,
  mut,
} from "@javelin/ecs"
import { graphics } from "./graphics"

const Position = createComponentFactory({
  type: 2 ** 0,
  schema: {
    x: number,
    y: number,
  },
})
const Velocity = createComponentFactory(
  {
    type: 2 ** 1,
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
const Sleep = createComponentFactory({
  type: 2 ** 2,
  schema: {
    value: number,
  },
})

const storage = new Storage()

enum Tags {
  Awake = 1,
}

for (let i = 0; i < 10000; i++) {
  const vx = Math.random() * 50
  const vy = Math.random() * 50

  storage.insert(
    i,
    [Position.create(), Velocity.create(vx, vy), Sleep.create()],
    Tags.Awake,
  )
}

class RenderCullFilter extends Filter {
  matchComponent(component: Component) {
    if (!isComponentOf(component, Position)) {
      return true
    }
    return component.y >= 0 && component.y <= 600 && component.x >= 0
  }
}

const bodies = new Query([Position, Velocity, Sleep]).filter(Tags.Awake)
const positions = new Query([Position]).filter(new RenderCullFilter())

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

function loop() {
  // physics system
  for (const [p, v, s] of bodies.run(storage)) {
    const { x, y } = p
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

    const ms = mut(s, storage)
    const sx = Math.abs(x - p.x) < 0.067
    const sy = Math.abs(y - p.y) < 0.067

    // put entities to sleep that haven't moved recently
    if (sx && sy && ++ms.value >= 5) {
      storage.removeTag(v._e, Tags.Awake)
      continue
    } else {
      ms.value = 0
    }
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
