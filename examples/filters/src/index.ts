import {
  ComponentOf,
  createComponentFactory,
  createQuery,
  createTagFilter,
  createWorld,
  number,
} from "@javelin/ecs"
import { app, framerate, graphics } from "./graphics"

enum Tags {
  Awake = 1,
}

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
const Sleep = createComponentFactory({
  type: 3,
  schema: {
    value: number,
  },
})

const awake = createTagFilter(Tags.Awake)
const bodies = createQuery(Position, Velocity, Sleep)
const positions = createQuery(Position)

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

function physics() {
  // physics system
  for (const [p, v, s] of world.query(bodies, awake)) {
    const { x, y } = p

    p.x += v.x
    p.y += v.y

    // put entities to sleep that haven't moved recently
    if (Math.abs(x - p.x) < 0.2 && Math.abs(y - p.y) < 0.2) {
      if (++s.value >= 5) {
        world.storage.removeTag(v._e, Tags.Awake)
        continue
      }
    } else {
      s.value = 0
    }

    if (p.y >= floorOffset) {
      // collision w/ floor and "restitution"
      v.y = -(v.y * 0.5)
      v.x *= 0.5
      p.y = floorOffset
      continue
    }

    if (p.x >= 800 || p.x <= 0) {
      // collision w/ wall and "restitution"
      v.x = -(v.x * 0.5)
      p.x = Math.max(0, Math.min(p.x, 800))
      continue
    }

    // gravity
    v.y += 0.1
  }
}

function render() {
  // render system
  graphics.clear()

  for (const [p] of world.query(positions, renderCullingFilter)) {
    graphics.beginFill(0x00ff00)
    graphics.drawRect(p.x, p.y, 1, 1)
    graphics.endFill()
  }
}

const world = createWorld([physics, render])

for (let i = 0; i < 15000; i++) {
  const vx = Math.random() * 50
  const vy = Math.random() * 50

  world.create(
    [Position.create(), Velocity.create(vx, vy), Sleep.create()],
    Tags.Awake,
  )
}

const renderCullingFilter = {
  matchEntity() {
    return true
  },
  matchComponent(component: ComponentOf<typeof Position>) {
    return component.x >= 0 && component.x <= 800 && component.y >= 0
  },
}

let tick = 0
let previousTime = 0

function loop(time = previousTime) {
  world.tick(time - (previousTime || time))

  if (++tick % 60 === 0) {
    framerate.text = `${app.ticker.FPS.toFixed(0)}`
  }

  requestAnimationFrame(loop)
  previousTime = time
}

loop()
