import { createComponentFactory, number } from "@javelin/ecs"

export const Sleep = createComponentFactory({
  name: "sleep",
  type: 3,
  schema: {
    value: number,
  },
})
