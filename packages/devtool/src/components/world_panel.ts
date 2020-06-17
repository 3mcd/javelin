import { World } from "@javelin/ecs"
import m from "mithril"

export function WorldPanel(name: string, world: World) {
  return {
    view() {
      const archetypeCount = world.storage.archetypes.length
      return m("div.WorldPanel", `${name} (${archetypeCount})`)
    },
  }
}
