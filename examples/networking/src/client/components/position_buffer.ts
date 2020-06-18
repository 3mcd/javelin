import { createComponentFactory, array, number } from "@javelin/ecs"

export const PositionBuffer = createComponentFactory({
  name: "position_buffer",
  type: 100,
  schema: {
    x: number,
    y: number,
    updates: array(array(number)),
  },
})
