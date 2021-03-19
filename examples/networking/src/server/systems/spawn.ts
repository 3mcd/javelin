import { query, timer, World } from "@javelin/ecs"
import { Velocity } from "../components"

const queries = {
  velocities: query(Velocity),
}

export function spawn(world: World<number>) {
  const shouldSpawn = timer(5000)

  if (shouldSpawn) {
    queries.velocities.forEach((entity, [velocity]) => {
      world.getObserved(velocity).y += Math.random() * 10
      world.getObserved(velocity).x += 1 - Math.random() * 2
    })
  }
}
