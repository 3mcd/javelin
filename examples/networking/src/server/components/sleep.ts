import { createComponentFactory, number } from "@javelin/ecs"

export const Sleep = createComponentFactory({
  type: 3,
  schema: {
    value: number,
  },
})
