import { query, World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { Velocity } from "../components"

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

const queries = {
  bodies: query(Position, Velocity),
}

export function physics(world: World) {
  queries.bodies.forEach((entity, [position, velocity]) => {
    position.x += velocity.x
    position.y += velocity.y

    if (position.y >= floorOffset) {
      // collision w/ floor and "restitution"
      velocity.y = -(velocity.y * 0.5)
      velocity.x *= 0.5
      position.y = floorOffset
    } else {
      // gravity
      velocity.y += 0.1
    }

    if (position.x >= 800 || position.x <= 0) {
      // collision w/ wall and "restitution"
      velocity.x = -(velocity.x * 0.5)
      position.x = Math.max(0, Math.min(position.x, 800))
    }
  })
}
