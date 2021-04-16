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
  effMessage,
  patch,
  spawn,
  attach,
  detach,
  destroy,
  copy,
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

const qryBody = createcreateQuery(Body)
const qryPlayer = createcreateQuery(Player)
const qryPlayerWBody = createcreateQuery(Player, Body)

const effObserve = createEffect(() => () => observe(), { global: true })

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
  const channel = effChannel()
  const observe = effObserve()
  const msgBase = effMessage()
  const msgPlayer = effMessage()

  each(effEnter(qryPlayer), entity => spawn(msgBase, entity))
  each(effExit(qryPlayer), entity => destroy(msgBase, entity))
  each(effAttached(Body), (entity, body) => attach(msgBase, entity, body))
  each(effDetached(Body), entity => detach(msgBase, entity, Body))

  if (send) {
    each(qryPlayerWBody, (entity, [bp]) => {
      copy(msgBase, msgPlayer)
      each(qryBody, (e, [b]) => {
        if (inRadius(b, bp, 100)) {
          const changes = observe.changes.get(b)
          patch(msgPlayer, entity, Body, changes)
        }
      })

      channel.of(entity).sendU(encode(msgPlayer))
      reset(msgPlayer)
    })

    reset(msgBase)
  }
}
```
