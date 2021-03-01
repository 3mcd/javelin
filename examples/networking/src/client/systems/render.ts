import { createComponentFilter, query, World } from "@javelin/ecs"
import { Color } from "../../common/components"
import { RenderTransform } from "../components/position_buffer"
import { graphics } from "../graphics"

const visible = createComponentFilter<typeof RenderTransform>(() => component =>
  component.x >= 0 && component.x <= 800 && component.y >= 0,
)

const queries = {
  offscreen: query(visible(RenderTransform)),
}

export function render(world: World) {
  graphics.clear()

  for (const [entity, position] of queries.offscreen) {
    const color = world.tryGetComponent(entity, Color)

    graphics.beginFill(color?.value || 0x00ff00)
    graphics.drawRect(position.x, position.y, 2, 2)
    graphics.endFill()
  }
}
