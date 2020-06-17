import {
  ComponentOf,
  createComponentFactory,
  createQuery,
  tag,
  createWorld,
  number,
  mut,
} from "@javelin/ecs"
import { context } from "./graphics"

enum Tags {
  Awake = 1,
}

const Position = createComponentFactory({
  name: "position",
  type: 1,
  schema: {
    x: number,
    y: number,
  },
})
const Velocity = createComponentFactory(
  {
    name: "velocity",
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
  name: "sleep",
  type: 3,
  schema: {
    value: number,
  },
})

const culling = {
  matchEntity() {
    return true
  },
  matchComponent(component: ComponentOf<typeof Position>) {
    return component.x >= 0 && component.x <= 800 && component.y >= 0
  },
}

const awake = createQuery(mut(Position), mut(Velocity), mut(Sleep)).filter(
  tag(Tags.Awake),
)
const culled = createQuery(Position).filter(culling)

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

function physics() {
  // physics system
  for (const [position, velocity, sleep] of world.query(awake)) {
    const { x, y } = position

    position.x += velocity.x
    position.y += velocity.y

    // put entities to sleep that haven't moved recently
    if (Math.abs(x - position.x) < 0.2 && Math.abs(y - position.y) < 0.2) {
      if (++sleep.value >= 5) {
        world.removeTag(velocity._e, Tags.Awake)
        continue
      }
    } else {
      sleep.value = 0
    }

    if (position.y >= floorOffset) {
      // collision w/ floor and "restitution"
      velocity.y = -(velocity.y * 0.5)
      velocity.x *= 0.5
      position.y = floorOffset
      continue
    }

    if (position.x >= 800 || position.x <= 0) {
      // collision w/ wall and "restitution"
      velocity.x = -(velocity.x * 0.5)
      position.x = Math.max(0, Math.min(position.x, 800))
      continue
    }

    // gravity
    velocity.y += 0.1
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
