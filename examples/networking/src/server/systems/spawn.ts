import { createQuery, tag, World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { createJunk } from "../entities"
import { Tags } from "../tags"

let elapsed = 0

const asleep = createQuery(Position).filter(tag(Tags.Awake, false))

export function spawn(world: World, dt: number) {
  elapsed += Math.max(dt, 0)
  if (elapsed > 1000) {
    elapsed = 0
    for (let i = 0; i < 2; i++) {
      createJunk(world)
    }
    let i = 0
    for (const [{ _e }] of world.query(asleep)) {
      world.destroy(_e)
      if (++i >= 2) break
    }
  }
}
