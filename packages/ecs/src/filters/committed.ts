import { World } from "../world"

export function committed() {
  return {
    matchEntity(entity: number, world: World) {
      return !world.isEphemeral(entity)
    },
    matchComponent() {
      return true
    },
  }
}
