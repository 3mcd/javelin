import { createComponentFactory, number } from "@javelin/ecs"

export const Velocity = createComponentFactory(
  {
    type: 2,
    schema: {
      x: number,
      y: number,
    },
  },
  (v, x = 0, y = 0) => {
    v.x = x
    v.y = y
  },
)
