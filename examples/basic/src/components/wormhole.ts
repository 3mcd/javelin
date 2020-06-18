import { createComponentFactory, number } from "@javelin/ecs"

export const Wormhole = createComponentFactory(
  {
    name: "wormhole",
    type: 3,
    schema: {
      radius: number,
    },
  },
  (c, r = 0) => (c.radius = r),
)
