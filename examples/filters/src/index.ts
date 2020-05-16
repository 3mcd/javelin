import {
  ComponentOf,
  createComponentFactory,
  createQuery,
  createTagFilter,
  createWorld,
  number,
} from "@javelin/ecs"
import { context } from "./graphics"

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
  (velocity, x = 0, y = 0) => {
    velocity.x = x
    velocity.y = y
  },
)
const Sleep = createComponentFactory({
  type: 3,
  schema: {
    value: number,
  },
})

const renderCullingFilter = {
  matchEntity() {
    return true
  },
  matchComponent(component: ComponentOf<typeof Position>) {
    return component.x >= 0 && component.x <= 800 && component.y >= 0
  },
}

const awake = createQuery(Position, Velocity, Sleep).filter(
  createTagFilter(Tags.Awake),
)
const culled = createQuery(Position).filter(renderCullingFilter)

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

function physics() {
  // physics system
  for (const [position, velocity, sleep] of world.query(awake)) {
    const { x, y } = position
    const p = world.mut(position)
    const v = world.mut(velocity)
    const s = world.mut(sleep)

    p.x += v.x
    p.y += v.y

    // put entities to sleep that haven't moved recently
    if (Math.abs(x - p.x) < 0.2 && Math.abs(y - p.y) < 0.2) {
      if (++s.value >= 5) {
        world.removeTag(v._e, Tags.Awake)
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
      p.x = Math.max(0, Math.min(position.x, 800))
      continue
    }

    // gravity
    v.y += 0.1
  }
}

function render() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight)

  for (const [position] of world.query(culled)) {
    context.fillStyle = "#00ff00"
    context.fillRect(position.x, position.y, 1, 1)
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

let previousTime = 0

function loop(time = previousTime) {
  world.tick(time - (previousTime || time))

  requestAnimationFrame(loop)
}

loop()
