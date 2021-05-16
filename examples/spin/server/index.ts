import { Component, component } from "@javelin/ecs"
import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { Big, Changes, Shell, Transform } from "./components"
import { TICK_RATE } from "./env"
import { world } from "./world"

const loop = createHrtimeLoop((1 / TICK_RATE) * 1000, clock => {
  world.tick(clock)
})

const createPointsAroundCircle = (r: number, n: number) => {
  const out = []
  for (let i = 0; i < n; i++) {
    const angle = (i / (n / 2)) * Math.PI
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    out.push([x, y])
  }
  return out
}

createPointsAroundCircle(50, 350).map(([x, y], i) => {
  const components: Component[] = [
    component(Transform, { position: [x, y] }),
    component(Shell, { value: (i % 6) + 1 }),
    component(Changes),
  ]
  if (i % 2 === 0) {
    components.push(component(Big))
  }
  world.spawn(...components)
})

loop.start()
