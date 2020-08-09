import { query, World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { Velocity } from "../components"

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

const awake = query(Position, Velocity)

export function physics(world: World, dt: number) {
  for (const [, [position, velocity]] of awake(world)) {
    const mutPosition = world.mut(position)
    const mutVelocity = world.mut(velocity)

    mutPosition.x += velocity.x
    mutPosition.y += velocity.y

    if (position.y >= floorOffset) {
      // collision w/ floor and "restitution"
      mutVelocity.y = -(velocity.y * 0.5)
      mutVelocity.x *= 0.5
      mutPosition.y = floorOffset
    }

    if (position.x >= 800 || position.x <= 0) {
      // collision w/ wall and "restitution"
      mutVelocity.x = -(velocity.x * 0.5)
      mutPosition.x = Math.max(0, Math.min(position.x, 800))
      continue
    }

    // gravity
    mutVelocity.y += 0.1
  }
}
