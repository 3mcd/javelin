import { createComponentType, number } from "@javelin/ecs"

export const Sleep = createComponentType({
  type: 3,
  schema: {
    value: number,
  },
})
