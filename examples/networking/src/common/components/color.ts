import { createComponentFactory, number } from "@javelin/ecs"

export const Color = createComponentFactory(
  {
    name: "color",
    type: 99,
    schema: {
      value: number,
    },
  },
  (color, value: number = 0xff0000) => (color.value = value),
)
