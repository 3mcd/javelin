import { createComponentFactory, number, ComponentOf } from "@javelin/ecs"

export const Velocity = createComponentFactory({
  name: "velocity",
  type: 2,
  schema: {
    x: number,
    y: number,
  },
})
