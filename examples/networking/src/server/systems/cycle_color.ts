import { query, World } from "@javelin/ecs"
import { Color, Position } from "../../common/components"

let elapsed = 0

const bodies = query(Position)
const colors = query(Color)

export function cycleColor(world: World, dt: number) {
  elapsed += Math.max(dt, 0)

  if (elapsed > 1000) {
    elapsed = 0

    for (const [entity] of bodies(world)) {
      if (Math.random() > 0.2) {
        continue
      }

      const color = world.tryGetComponent(entity, Color)

      if (color) {
        world.detach(entity, color)
      } else {
        world.attach(entity, world.component(Color))
      }
    }

    for (const [, [color]] of colors(world)) {
      const mutColor = world.getMutableComponent(color)

      if (color.value === 0xff0000) {
        mutColor.value = 0x0000ff
      } else {
        mutColor.value = 0xff0000
      }
    }
  }
}
