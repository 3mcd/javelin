import { createComponentFactory, array, number } from "@javelin/ecs"

export const RenderTransform = createComponentFactory({
  name: "render_transform",
  type: 100,
  schema: {
    x: number,
    y: number,
    updates: array(array(number)),
  },
})
