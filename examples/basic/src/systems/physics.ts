import { World } from "@javelin/ecs"
import { junk } from "../queries"

export function physics(_: any, world: World) {
  for (const [position, velocity] of world.query(junk)) {
    const p = world.mut(position)

    p.x += velocity.x
    p.y += velocity.y
  }
}
