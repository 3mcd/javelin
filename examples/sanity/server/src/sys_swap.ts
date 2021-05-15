import { component, useInterval } from "@javelin/ecs"
import { Big, Shell, Transform, Changes } from "./components.mjs"
import { qry_transforms } from "./queries.mjs"

export const sys_swap = world => {
  const swap = useInterval(1000)

  if (!swap) {
    return
  }

  let count = 0

  for (const [entities] of qry_transforms) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const random = Math.random()

      if (random > 0.9) {
        world.destroy(e)
        count++
      } else if (random > 0.5) {
        if (world.has(e, Big)) {
          world.detach(e, Big)
        } else {
          world.attach(e, component(Big))
        }
      }
    }
  }

  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    world.spawn(
      component(Transform, {
        position: [Math.cos(a) * 50, Math.sin(a) * 50],
      }),
      component(Shell, { value: (i % 6) + 1 }),
      component(Changes),
    )
  }
}
