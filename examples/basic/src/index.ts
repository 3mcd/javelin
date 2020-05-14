import {
  ComponentOf,
  createComponentFactory,
  createQuery,
  createWorld,
  number,
} from "@javelin/ecs"
import { context, canvas } from "./graphics"

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

let junkPosition
let junkVelocity
let wormholePosition
let wormhole

function render() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight)

  for ([junkPosition] of world.query(junk)) {
    context.fillStyle = world.storage.hasTag(junkPosition._e, Tags.Influenced)
      ? "#00ff00"
      : "#eeeeee"
    context.fillRect(junkPosition.x, junkPosition.y, 1, 1)
  }

  for ([wormholePosition, wormhole] of world.query(wormholes)) {
    context.fillStyle = "#000000"
    context.strokeStyle = "#333333"
    context.arc(
      wormholePosition.x,
      wormholePosition.y,
      calcWormholeHorizon(wormhole as any),
      0,
      2 * Math.PI,
    )
  }
}

let dx
let dy
let len

let nx
let ny

function attract() {
  // wormhole system
  for ([junkPosition, junkVelocity] of world.query(junk)) {
    for ([wormholePosition, wormhole] of world.query(wormholes)) {
      dx = wormholePosition.x - junkPosition.x
      dy = wormholePosition.y - junkPosition.y
      len = Math.sqrt(dx * dx + dy * dy)

      if (len <= wormhole.radius) {
        world.storage.addTag(junkPosition._e, Tags.Influenced)
        if (len < calcWormholeHorizon(wormhole as any)) {
          world.destroy(junkPosition._e)
          wormhole.radius += 0.25
        } else {
          nx = dx / len
          ny = dy / len

          junkVelocity.x += nx / 100
          junkVelocity.y += ny / 100
        }
      }
    }
  }
}

function physics() {
  // physics system
  for ([junkPosition, junkVelocity] of world.query(junk)) {
    junkPosition.x += junkVelocity.x
    junkPosition.y += junkVelocity.y
  }
}

const world = createWorld([attract, physics])

const junkCount = 15000
const calcWormholeHorizon = (wormhole: ComponentOf<typeof Wormhole>) =>
  wormhole.radius / 10

for (let i = 0; i < junkCount; i++) {
  world.create([
    Position.create(Math.random() * 1680, Math.random() * 916),
    Velocity.create(),
  ])
}

const junk = createQuery(Position, Velocity)
const wormholes = createQuery(Position, Wormhole)

function loop() {
  world.tick(0)

  requestAnimationFrame(loop)
}

let ix = 0
let iy = 0

canvas.addEventListener("mousedown", onMouseDown)
canvas.addEventListener("mouseup", onMouseUp)

function onMouseDown(event: MouseEvent) {
  ix = event.x
  iy = event.y
}

function onMouseUp(event: MouseEvent) {
  const dx = event.x - ix
  const dy = event.y - iy
  const r = Math.sqrt(dx * dx + dy * dy) * 10

  world.create([Position.create(ix, iy), Wormhole.create(r)])
}

loop()
