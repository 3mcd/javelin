import { query, World } from "@javelin/ecs"
import { Color } from "../../common/components"
import { RenderTransform } from "../components/position_buffer"
import { graphics } from "../graphics"

const queries = {
  offscreen: query(RenderTransform),
}

export function render(world: World) {
  graphics.clear()

  queries.offscreen.forEach((entity, [{ x, y }]) => {
    if (x >= 0 && x <= 800 && y >= 0) {
      const color = world.tryGet(entity, Color)

      graphics.beginFill(color?.value || 0x00ff00)
      graphics.drawRect(x, y, 2, 2)
      graphics.endFill()
    }
  })
}
