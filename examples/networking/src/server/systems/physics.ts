import { query, World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { Velocity } from "../components"

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

const queries = {
  awake: query(Position, Velocity),
}

export function physics(world: World) {
  for (const [, position, velocity] of queries.awake) {
    const mutPosition = world.getObservedComponent(position)
    const mutVelocity = world.getObservedComponent(velocity)

    mutPosition.x += velocity.x
    mutPosition.y += velocity.y

    if (position.y >= floorOffset) {
      // collision w/ floor and "restitution"
      mutVelocity.y = -(velocity.y * 0.5)
      mutVelocity.x *= 0.5
      mutPosition.y = floorOffset
    } else {
      // gravity
      mutVelocity.y += 0.1
    }

    if (position.x >= 800 || position.x <= 0) {
      // collision w/ wall and "restitution"
      mutVelocity.x = -(velocity.x * 0.5)
      mutPosition.x = Math.max(0, Math.min(position.x, 800))
      continue
    }
  }
}
