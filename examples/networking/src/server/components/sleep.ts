import { createComponentType, number } from "@javelin/ecs"

export const Sleep = createComponentType({
  name: "sleep",
  type: 3,
  schema: {
    value: number,
  },
})
