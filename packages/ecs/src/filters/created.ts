import { Filter } from "../query"
import { World } from "../world"

export function created(): Filter {
  function matchEntity(entity: number, world: World) {
    return world.created.has(entity)
  }

  function matchComponent() {
    return true
  }

  return { matchEntity, matchComponent }
}
