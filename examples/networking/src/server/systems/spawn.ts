import { query, tag, World, select } from "@javelin/ecs"
import { Position } from "../../common/components"
import { createJunk } from "../entities"
import { Tags } from "../tags"

let elapsed = 0

const positions = query(select(Position))
const asleep = query(select(Position), tag(Tags.Awake, false))

export function spawn(world: World, dt: number) {
  elapsed += Math.max(dt, 0)

  if (elapsed > 1000) {
    elapsed = 0

    for (let i = 0; i < 2; i++) {
      createJunk(world)
    }

    let i = 0

    for (const [{ _e: entity }] of asleep(world)) {
      if (i++ < 2) {
        world.destroy(entity)
      }
    }
  }
}
