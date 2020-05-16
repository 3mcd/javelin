import { createComponentFactory, number } from "@javelin/ecs"

export const Velocity = createComponentFactory({
  type: 2,
  schema: {
    x: number,
    y: number,
  },
})
