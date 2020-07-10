import { createQuery, tag, World, mut } from "@javelin/ecs"
import { Position } from "../../common/components"
import { Sleep, Velocity } from "../components"
import { Tags } from "../tags"

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

const awake = createQuery(mut(Position), mut(Velocity), mut(Sleep)).filter(
  tag(Tags.Awake),
)

export function physics(world: World, dt: number) {
  for (const [position, velocity, sleep] of world.query(awake)) {
    const { x, y } = position

    position.x += velocity.x
    position.y += velocity.y

    // put entities to sleep that haven't moved recently
    if (Math.abs(x - position.x) < 0.2 && Math.abs(y - position.y) < 0.2) {
      if (++sleep.value >= 5) {
        world.removeTag(velocity._e, Tags.Awake)
        continue
      }
    } else {
      sleep.value = 0
    }

    if (position.y >= floorOffset) {
      // collision w/ floor and "restitution"
      velocity.y = -(velocity.y * 0.5)
      velocity.x *= 0.5
      position.y = floorOffset
      continue
    }

    if (position.x >= 800 || position.x <= 0) {
      // collision w/ wall and "restitution"
      velocity.x = -(velocity.x * 0.5)
      position.x = Math.max(0, Math.min(position.x, 800))
      continue
    }

    // gravity
    velocity.y += 0.1
  }
}
