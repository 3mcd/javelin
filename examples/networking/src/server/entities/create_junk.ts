import { Storage } from "@javelin/ecs"
import { Position } from "../../common/components"
import { Sleep, Velocity } from "../components"
import { Tags } from "../tags"

export function createJunk(storage: Storage) {
  const vx = Math.random() * 50
  const vy = Math.random() * 50
  const entity = storage.create([
    Position.create(),
    Velocity.create(vx, vy),
    Sleep.create(),
  ])
  storage.addTag(entity, Tags.Awake)

  return entity
}
