import { createQuery, createTagFilter, World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { createJunk } from "../entities"
import { Tags } from "../tags"

let elapsed = 0

const asleep = createTagFilter(Tags.Awake, false)
const positions = createQuery(Position)

export function spawn(dt: number, world: World) {
  elapsed += Math.max(dt, 0)

  if (elapsed > 1000) {
    elapsed = 0

    for (let i = 0; i < 100; i++) {
      createJunk(world)
    }

    let i = 0

    for (const [{ _e }] of world.query(positions, asleep)) {
      world.destroy(_e)
      if (++i >= 100) break
    }
  }
}
