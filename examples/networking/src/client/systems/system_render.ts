import { ComponentOf, createQuery, World } from "@javelin/ecs"
import { PositionBuffer } from "../components/position_buffer"
import { graphics } from "../graphics"

const positions = createQuery(PositionBuffer)

const renderCullingFilter = {
  matchEntity() {
    return true
  },
  matchComponent(component: ComponentOf<typeof PositionBuffer>) {
    return component.x >= 0 && component.x <= 800 && component.y >= 0
  },
}

export function render(dt: number, world: World) {
  // render system
  graphics.clear()

  for (const [p] of world.query(positions, renderCullingFilter)) {
    graphics.beginFill(0x00ff00)
    graphics.drawRect(p.x, p.y, 2, 2)
    graphics.endFill()
  }
}
