import { query, select, tag, World } from "@javelin/ecs"
import { Position, Red } from "../../common/components"
import { Sleep, Velocity } from "../components"
import { Tags } from "../tags"

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

const awake = query(select(Position, Velocity, Sleep), tag(Tags.Awake))

export function physics(world: World, dt: number) {
  for (const [position, velocity, sleep] of awake(world)) {
    const { x, y } = position
    const mutPosition = world.mut(position)
    const mutVelocity = world.mut(velocity)
    const mutSleep = world.mut(sleep)

    mutPosition.x += velocity.x
    mutPosition.y += velocity.y

    // put entities to sleep that haven't moved recently
    if (Math.abs(x - position.x) < 0.2 && Math.abs(y - position.y) < 0.2) {
      if (++mutSleep.value >= 5) {
        world.removeTag(velocity._e, Tags.Awake)
        continue
      }
    } else {
      mutSleep.value = 0
    }

    if (position.y >= floorOffset) {
      // collision w/ floor and "restitution"
      mutVelocity.y = -(velocity.y * 0.5)
      mutVelocity.x *= 0.5
      mutPosition.y = floorOffset
      const red = world.tryGetComponent(position._e, Red)
      if (red) {
        world.remove(position._e, [red])
      } else {
        world.insert(position._e, [Red.create()])
      }
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
