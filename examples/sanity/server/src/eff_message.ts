import { createEffect, useMonitor, World } from "@javelin/ecs"
import { createMessageProducer } from "@javelin/net"
import { reset } from "@javelin/track"
import { Big } from "./components"
import {
  qry_transforms_w_big,
  qry_transforms_w_changes,
  qry_transforms_w_shell,
} from "./queries"

export const getInitialMessage = (world: World) => {
  const producer = createMessageProducer()

  for (const [entities, [transforms, shells]] of qry_transforms_w_shell) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const t = transforms[i]
      const s = shells[i]
      producer.spawn(e, world.has(e, Big) ? [t, world.get(e, Big), s] : [t, s])
    }
  }

  return producer.take(true)
}

export const eff_message = createEffect(world => {
  const producer = createMessageProducer()

  return function eff_message(update = false) {
    useMonitor(
      qry_transforms_w_shell,
      e => {
        const components = qry_transforms_w_shell.get(e)
        if (components) {
          producer.spawn(e, components)
        }
      },
      e => producer.destroy(e),
    )
    useMonitor(
      qry_transforms_w_big,
      (e, [, b]) => b && producer.attach(e, [b]),
      (e, [, b]) => b && producer.detach(e, [b]),
    )

    if (update) {
      qry_transforms_w_changes((e, [t, c]) => {
        producer.patch(e, c)
        // Uncomment this line to perform a full sync instead of sending only
        // changed properties
        // producer.update(e, [t])
        reset(c)
      })
    }
    return producer
  }
})
