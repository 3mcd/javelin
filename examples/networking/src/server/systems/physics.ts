import { createQuery, createTagFilter, World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { Sleep, Velocity } from "../components"
import { Tags } from "../tags"

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

const awake = createQuery(Position, Velocity, Sleep).filter(
  createTagFilter(Tags.Awake),
)

export function physics(dt: number, world: World) {
  for (const [position, velocity, sleep] of world.query(awake)) {
    const { x, y } = position
    const p = world.mut(position)
    const v = world.mut(velocity)
    const s = world.mut(sleep)

    p.x += velocity.x
    p.y += velocity.y

    // put entities to sleep that haven't moved recently
    if (Math.abs(x - position.x) < 0.2 && Math.abs(y - position.y) < 0.2) {
      if (++s.value >= 5) {
        world.removeTag(velocity._e, Tags.Awake)
        continue
      }
    } else {
      s.value = 0
    }

    if (position.y >= floorOffset) {
      // collision w/ floor and "restitution"
      v.y = -(v.y * 0.5)
      v.x *= 0.5
      p.y = floorOffset
      continue
    }

    if (position.x >= 800 || position.x <= 0) {
      // collision w/ wall and "restitution"
      v.x = -(v.x * 0.5)
      p.x = Math.max(0, Math.min(position.x, 800))
      continue
    }

    // gravity
    v.y += 0.1
  }
}
