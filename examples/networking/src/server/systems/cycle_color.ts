import { query, select, World } from "@javelin/ecs"
import { Color } from "../../common/components"

let elapsed = 0

const colors = query(select(Color))

export function cycleColor(world: World, dt: number) {
  elapsed += Math.max(dt, 0)

  if (elapsed > 1000) {
    elapsed = 0

    for (const [color] of colors(world)) {
      if (Math.random() > 0.5) {
        const mutColor = world.mut(color)
        if (color.value === 0xff0000) {
          mutColor.value = 0x0000ff
        } else {
          mutColor.value = 0xff0000
        }
      }
    }
  }
}
