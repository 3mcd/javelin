import {
  Component,
  ComponentOf,
  createComponentFactory,
  createQuery,
  createStorage,
  number,
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
const Sleep = createComponentFactory({
  type: 3,
  schema: {
    value: number,
  },
})

const storage = createStorage()

enum Tags {
  Awake = 1,
}

for (let i = 0; i < 15000; i++) {
  const vx = Math.random() * 50
  const vy = Math.random() * 50

  storage.insert(
    [Position.create(), Velocity.create(vx, vy), Sleep.create()],
    Tags.Awake,
  )
}

const renderCullingFilter = {
  match(component: ComponentOf<typeof Position>) {
    return component.x >= 0 && component.x <= 800 && component.y >= 0
  },
}

const awakeFilter = {
  match(component: Component, storage: Storage) {
    return storage.hasTag(component._e, Tags.Awake)
  },
}

const bodies = createQuery(Position, Velocity, Sleep)
const positions = createQuery(Position)

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

function loop() {
  // physics system
  for (const [p, v, s] of bodies.run(storage, awakeFilter)) {
    const { x, y } = p

    p.x += v.x
    p.y += v.y

    storage.incrementVersion(p)
    storage.incrementVersion(v)

    // put entities to sleep that haven't moved recently
    if (Math.abs(x - p.x) < 0.2 && Math.abs(y - p.y) < 0.2) {
      if (++s.value >= 5) {
        storage.removeTag(v._e, Tags.Awake)
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

  // render system
  graphics.clear()

  for (const [p] of positions.run(storage, renderCullingFilter)) {
    graphics.beginFill(0x00ff00)
    graphics.drawRect(p.x, p.y, 1, 1)
    graphics.endFill()
  }

  requestAnimationFrame(loop)
}

loop()
