import { interval, query } from "@javelin/ecs"
import { Velocity } from "../components"

const queries = {
  velocities: query(Velocity),
}

export function jump() {
  if (interval(5000)) {
    queries.velocities.forEach((entity, [velocity]) => {
      velocity.y += Math.random() * 10
      velocity.x += 1 - Math.random() * 2
    })
  }
}
