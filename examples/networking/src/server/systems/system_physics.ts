import { createQuery, createTagFilter, Storage } from "@javelin/ecs"
import { Position } from "../../common/components"
import { Sleep, Velocity } from "../components"
import { Tags } from "../tags"

const size = 2
const floorSize = 10
const floorOffset = 600 - size - floorSize

const query = createQuery(Position, Velocity, Sleep)
const awake = createTagFilter(Tags.Awake)

export function physics(storage: Storage) {
  for (const [p, v, s] of query.run(storage, awake)) {
    const { x, y } = p

    p.x += v.x
    p.y += v.y

    // put entities to sleep that haven't moved recently
    if (Math.abs(x - p.x) < 0.2 && Math.abs(y - p.y) < 0.2) {
      if (++s.value >= 5) {
        storage.removeTag(v._e, Tags.Awake)
        continue
      }
    } else {
      s.value = 0
    }

    if (p.y >= floorOffset) {
      // collision w/ floor and "restitution"
      v.y = -(v.y * 0.5)
      v.x *= 0.5
      p.y = floorOffset
      continue
    }

    if (p.x >= 800 || p.x <= 0) {
      // collision w/ wall and "restitution"
      v.x = -(v.x * 0.5)
      p.x = Math.max(0, Math.min(p.x, 800))
      continue
    }

    // gravity
    v.y += 0.1
  }
}
