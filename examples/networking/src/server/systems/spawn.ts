import { query, World } from "@javelin/ecs"
import { Velocity } from "../components"

let elapsed = 0

const queries = {
  velocities: query(Velocity),
}

export function spawn(world: World<number>) {
  elapsed += Math.max(world.state.currentTickData, 0)

  if (elapsed > 5000) {
    for (const [, velocity] of queries.velocities) {
      world.getObservedComponent(velocity).y += Math.random() * 10
      world.getObservedComponent(velocity).x += 1 - Math.random() * 2
      elapsed = 0
    }
  }
}
