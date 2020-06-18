import { createComponentFactory, number } from "@javelin/ecs"

export const Velocity = createComponentFactory(
  {
    name: "velocity",
    type: 2,
    schema: {
      x: number,
      y: number,
    },
  },
  (v, x: number = 0, y: number = 0) => {
    v.x = x
    v.y = y
  },
)
