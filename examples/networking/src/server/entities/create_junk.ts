import { World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { Sleep, Velocity } from "../components"
import { Tags } from "../tags"

export function createJunk(world: World) {
  const vx = Math.random() * 50
  const vy = Math.random() * 50
  const entity = world.create(
    [Position.create(), Velocity.create(vx, vy), Sleep.create()],
    Tags.Awake,
  )

  return entity
}
