import { createComponentType, number } from "@javelin/ecs"

export const Velocity = createComponentType({
  type: 2,
  schema: {
    x: number,
    y: number,
  },
  initialize: (v, x: number = 0, y: number = 0) => {
    v.x = x
    v.y = y
  },
})
