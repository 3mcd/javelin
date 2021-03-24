import { createComponentType, number } from "@javelin/ecs"

export const Position = createComponentType({
  type: 1,
  schema: {
    x: number,
    y: number,
  },
  initialize: (c, x: number = 0, y: number = 0) => {
    c.x = x
    c.y = y
  },
})
