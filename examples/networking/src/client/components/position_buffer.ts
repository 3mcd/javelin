import { array, createComponentType, number } from "@javelin/ecs"

export const RenderTransform = createComponentType({
  type: 100,
  schema: {
    x: number,
    y: number,
    updates: array(array(number)),
  },
})
