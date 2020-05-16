import { Filter } from "../query"
import { World } from "../world"

export function createDestroyedFilter(): Filter {
  function matchEntity(entity: number, world: World) {
    return world.destroyed.has(entity)
  }

  function matchComponent() {
    return true
  }

  return { matchEntity, matchComponent }
}
