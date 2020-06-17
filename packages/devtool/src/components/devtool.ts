import m from "mithril"
import { World } from "@javelin/ecs"
import { JavelinMessage } from "@javelin/net"
import { WorldPanel } from "./world_panel"

export type WorldConfig = { name: string; world: World }

export function Devtool(
  worlds: WorldConfig[],
  onMessage?: (world: World, message: JavelinMessage) => unknown,
) {
  let world = worlds[0]

  return {
    view() {
      return m("div.Devtool", [
        m(
          "select",
          {
            onchange: (e: InputEvent) =>
              (world = worlds[(<HTMLSelectElement>e.target).selectedIndex]),
          },
          worlds.map(world => m("option", world.name)),
        ),
        m(WorldPanel(world.name, world.world)),
      ])
    },
  }
}
