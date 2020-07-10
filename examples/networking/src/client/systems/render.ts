import { ComponentOf, createQuery, World } from "@javelin/ecs"
import { PositionBuffer } from "../components/position_buffer"
import { graphics } from "../graphics"

const renderCullingFilter = {
  matchEntity() {
    return true
  },
  matchComponent(component: ComponentOf<typeof PositionBuffer>) {
    return component.x >= 0 && component.x <= 800 && component.y >= 0
  },
}

const culledPositions = createQuery(PositionBuffer).filter(renderCullingFilter)

export function render(world: World, dt: number) {
  // render system
  graphics.clear()

  for (const [p] of world.query(culledPositions)) {
    graphics.beginFill(0x00ff00)
    graphics.drawRect(p.x, p.y, 2, 2)
    graphics.endFill()
  }
}
