import { Storage, createQuery, createTagFilter } from "@javelin/ecs"
import { createJunk } from "../entities"
import { Tags } from "../tags"
import { Position } from "../../common/components"

let elapsed = 0

const asleep = createTagFilter(Tags.Awake, false)
const positions = createQuery(Position)

export function spawn(storage: Storage, dt: number) {
  elapsed += dt

  if (elapsed > 1000) {
    elapsed = 0

    for (let i = 0; i < 100; i++) {
      createJunk(storage)
    }

    let i = 0

    for (const [{ _e }] of positions.run(storage, asleep)) {
      storage.addTag(_e, Tags.Removing)
      if (++i >= 100) break
    }
  }
}
