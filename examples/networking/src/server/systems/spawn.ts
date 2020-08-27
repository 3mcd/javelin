import { query, World } from "@javelin/ecs"
import { Velocity } from "../components"

let elapsed = 0

const velocities = query(Velocity)

export function spawn(world: World, dt: number) {
  elapsed += Math.max(dt, 0)

  if (elapsed > 5000) {
    for (const [, [velocity]] of velocities(world)) {
      world.getMutableComponent(velocity).y += Math.random() * 10
      world.getMutableComponent(velocity).x += 1 - Math.random() * 2
      elapsed = 0
    }
  }
}
