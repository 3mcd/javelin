import { query, World } from "@javelin/ecs"
import { Color, Position } from "../../common/components"

let elapsed = 0

const queries = {
  bodies: query(Position),
  colors: query(Color),
}

export function cycleColor(world: World<number>) {
  elapsed += Math.max(world.state.currentTickData, 0)

  if (elapsed > 1000) {
    elapsed = 0

    for (const [entity] of queries.bodies) {
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

    for (const [, color] of queries.colors) {
      const mutColor = world.getObservedComponent(color)

      if (color.value === 0xff0000) {
        mutColor.value = 0x0000ff
      } else {
        mutColor.value = 0xff0000
      }
    }
  }
}
