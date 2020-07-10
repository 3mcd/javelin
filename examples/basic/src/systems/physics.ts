import { World } from "@javelin/ecs"
import { junk } from "../queries"

export function physics(world: World) {
  for (const [position, velocity] of world.query(junk)) {
    position.x += velocity.x
    position.y += velocity.y
  }
}
