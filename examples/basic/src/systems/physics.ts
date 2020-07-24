import { World, ComponentType, ComponentsOf } from "@javelin/ecs"
import { junk } from "../queries"

export function physics(world: World) {
  for (let [p, v] of junk(world)) {
    const mp = world.mut(p)
    mp.x += v.x
    mp.y += v.y
  }
}
