import { createComponentType, number } from "@javelin/ecs"

export const Position = createComponentType({
  name: "position",
  type: 1,
  schema: {
    x: number,
    y: number,
  },
  initialize: (c, x = 0, y = 0) => {
    c.x = x
    c.y = y
  },
})
