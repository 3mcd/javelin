import { World } from "@javelin/ecs"
import { junk, wormholes } from "../queries"
import { Tags } from "../tags"
import { calcWormholeHorizon } from "../utils/calc_wormhole_horizon"

export function attract(world: World) {
  for (let [wp, w] of wormholes(world)) {
    for (let [jp, jv] of junk(world)) {
      const dx = wp.x - jp.x
      const dy = wp.y - jp.y
      const len = Math.sqrt(dx * dx + dy * dy)

      if (len <= w.radius) {
        world.addTag(jp._e, Tags.Influenced)
        if (len < calcWormholeHorizon(w as any)) {
          world.destroy(jp._e)
          world.mut(w).radius += 0.25
        } else {
          const nx = dx / len
          const ny = dy / len
          const mv = world.mut(jv)

          mv.x += nx / 100
          mv.y += ny / 100
        }
      }
    }
  }
}
