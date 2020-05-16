import { World } from "@javelin/ecs"
import { junk, wormholes } from "../queries"
import { Tags } from "../tags"
import { calcWormholeHorizon } from "../utils/calc_wormhole_horizon"

export function attract(_: void, world: World) {
  for (const [junkPosition, junkVelocity] of world.query(junk)) {
    const jv = world.mut(junkVelocity)

    for (const [wormholePosition, wormhole] of world.query(wormholes)) {
      const w = world.mut(wormhole)
      const dx = wormholePosition.x - junkPosition.x
      const dy = wormholePosition.y - junkPosition.y
      const len = Math.sqrt(dx * dx + dy * dy)

      if (len <= wormhole.radius) {
        world.addTag(junkPosition._e, Tags.Influenced)
        if (len < calcWormholeHorizon(wormhole as any)) {
          world.destroy(junkPosition._e)
          w.radius += 0.25
        } else {
          const nx = dx / len
          const ny = dy / len

          jv.x += nx / 100
          jv.y += ny / 100
        }
      }
    }
  }
}
