import { createEffect, useMonitor, World } from "@javelin/ecs"
import { createMessageProducer } from "@javelin/net"
import { reset } from "@javelin/track"
import { Big } from "./components"
import { BIG_PRIORITY, MESSAGE_MAX_BYTE_LENGTH, SMALL_PRIORITY } from "./env"
import {
  qryTransformsWBig,
  qryTransformsWChanges,
  qryTransformsWShell,
} from "./queries"

export const getInitialMessage = (world: World) => {
  const producer = createMessageProducer()

  for (const [entities, [transforms, shells]] of qryTransformsWShell) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const t = transforms[i]
      const s = shells[i]
      producer.spawn(e, world.has(e, Big) ? [t, world.get(e, Big), s] : [t, s])
    }
  }

  return producer.take(true)
}

export const eff_message = createEffect(({ has }) => {
  const producer = createMessageProducer({
    maxByteLength: MESSAGE_MAX_BYTE_LENGTH,
  })

  return function eff_message(update = false) {
    useMonitor(
      qryTransformsWShell,
      e => producer.spawn(e, qryTransformsWShell.get(e)),
      e => producer.destroy(e),
    )
    useMonitor(
      qryTransformsWBig,
      (e, [, b]) => b && producer.attach(e, [b]),
      (e, [, b]) => b && producer.detach(e, [b]),
    )

    if (update) {
      qryTransformsWChanges((e, [t, c]) => {
        const priority = has(e, Big) ? BIG_PRIORITY : SMALL_PRIORITY
        producer.patch(e, c, priority)
        reset(c)
      })
    }
    return producer
  }
})
