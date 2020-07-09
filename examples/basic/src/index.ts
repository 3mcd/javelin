import { createWorld } from "@javelin/ecs"
import { Position, Velocity, Wormhole } from "./components"
import { attract, canvas, physics, render } from "./systems"

const world = createWorld<void>({
  systems: [physics, attract, render],
  componentFactories: [Position, Velocity, Wormhole],
})
const junkCount = 10000

world.registerComponentFactory(Position)
world.registerComponentFactory(Velocity)
world.registerComponentFactory(Wormhole)

for (let i = 0; i < junkCount; i++) {
  world.create([
    Position.create(Math.random() * 1680, Math.random() * 916),
    Velocity.create(),
  ])
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

function loop() {
  world.tick()
  requestAnimationFrame(loop)
}

loop()
