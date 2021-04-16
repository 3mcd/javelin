# `@javelin/net`

Networking protocol and utilities for Javelin ECS.

## Examples

### Filtering

```ts
import { observe, number, string } from "@javelin/model"
import {
  Entity,
  createQuery,
  createEffect,
  effEnter,
  effExit,
  effAttached,
  effDetached,
  effInterval,
  each,
} from "@javelin/ecs"
import {
  Message,
  createMessage,
  patch,
  spawn,
  attach,
  detach,
  destroy,
  pipe,
  reset,
} from "@javelin/protocol"

const Player = {
  name: string,
}
const Body = {
  x: number,
  y: number,
  vx: number,
  vy: number,
}

const qryBody = createQuery(Body)
const qryPlayer = createQuery(Player)
const qryPlayerWBody = createQuery(Player, Body)

const effObserve = createEffect(() => () => observe(), { global: true })
const effMessageRoot = createEffect(
  () => {
    const message = createMessage()
    return () => message
  },
  { global: true },
)
const effMessagePlayers = createEffect(() => {
  const messages = new Map<number, Message>()
  const get = (entity: Entity) => {
    let message = messages.get(entity)
    if (message === undefined) {
      messages.set(entity, (message = createMessage()))
    }
    return message
  }
  return () => get
})

const sysPhysics = () => {
  const observe = effObserve()
  qryBody.forEach((entity, [b]) => {
    const bObserved = observe(b)
    bObserved.x += b.vx
    bObserved.y += b.vy
  })
}
const sysNet = () => {
  const send = effInterval((1 / 20) * 1000)
  const observe = effObserve()
  const msgRoot = effMessageRoot()
  const msgPlayers = effMessagePlayers()

  each(effEnter(qryPlayer), entity => spawn(msgRoot, entity))
  each(effExit(qryPlayer), entity => destroy(msgRoot, entity))
  each(effAttached(Body), (entity, body) => attach(msgRoot, entity, body))
  each(effDetached(Body), entity => detach(msgRoot, entity, Body))

  if (send) {
    each(qryPlayerWBody, (entity, [bp]) => {
      const msgPlayer = msgPlayers(entity)
      const msg = pipe(msgRoot, msgPlayers)

      each(qryBody, (e, [b]) => {
        if (inRadius(b, bp, 100)) {
          const changes = observe.changes.get(b)
          patch(msg, entity, Body, changes)
        }
      })

      send(entity, msg)
      reset(msgPlayer)
    })

    reset(msgRoot)
  }
}
```
