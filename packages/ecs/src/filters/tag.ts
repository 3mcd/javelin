import { Filter } from "../query"
import { World } from "../world"

export function createTagFilter(tag: number, has = true): Filter {
  const matchEntity = has
    ? (entity: number, world: World) => world.storage.hasTag(entity, tag)
    : (entity: number, world: World) => !world.storage.hasTag(entity, tag)

  function matchComponent() {
    return true
  }

  return { matchEntity, matchComponent }
}
