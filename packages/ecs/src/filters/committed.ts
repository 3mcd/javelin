import { World } from "../world"

export function committed() {
  return {
    matchEntity(entity: number, world: World) {
      return world.isCommitted(entity)
    },
    matchComponent() {
      return true
    },
  }
}
