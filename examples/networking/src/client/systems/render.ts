import { ComponentOf, query, World, select } from "@javelin/ecs"
import { Color } from "../../common/components"
import { RenderTransform } from "../components/position_buffer"
import { graphics } from "../graphics"

const renderCullingFilter = {
  matchEntity() {
    return true
  },
  matchComponent(component: ComponentOf<typeof RenderTransform>) {
    return component.x >= 0 && component.x <= 800 && component.y >= 0
  },
}

const culledPositions = query(select(RenderTransform), renderCullingFilter)

export function render(world: World, dt: number) {
  // render system
  graphics.clear()

  for (const [position] of culledPositions(world)) {
    const color = world.tryGetComponent(position._e, Color)

    graphics.beginFill(color?.value || 0x00ff00)
    graphics.drawRect(position.x, position.y, 2, 2)
    graphics.endFill()
  }
}
