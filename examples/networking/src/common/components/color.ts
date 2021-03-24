import { createComponentType, number } from "@javelin/ecs"

export const Color = createComponentType({
  type: 99,
  schema: {
    value: number,
  },
  initialize: (color, value: number = 0xff0000) => (color.value = value),
})
