import { Filter } from "../query"
import { World } from "../world"

export function createAddedFilter(): Filter {
  function matchEntity(entity: number, world: World) {
    return world.created.has(entity)
  }

  function matchComponent() {
    return true
  }

  return { matchEntity, matchComponent }
}
