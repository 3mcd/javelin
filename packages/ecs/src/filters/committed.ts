import { World } from "../world"

export function createCommittedFilter() {
  return {
    matchEntity(entity: number, world: World) {
      return !world.destroyed.has(entity)
    },
    matchComponent() {
      return true
    },
  }
}
