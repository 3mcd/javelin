# `@javelin/net`

Networking protocol and utilities for Javelin ECS.

## Examples

### Filtering

```ts
const MAX_UPDATE_DISTANCE = 1000
const MAX_UPDATE_BODIES = 25

const Player = {}
const Body = {
  x: float64,
  y: float64,
  vx: float64,
  vy: float64,
}

const players = createQuery(Player, Body)
const bodies = createQuery(Body)

const sysPhysics = () => {
  const observe = effObserve()

  each(bodies, (e, [b]) => {
    const bo = observe(b)
    bo.x += b.vx
    bo.y += b.vy
  })
}

const sysNetPrioritize = () => {
  const { changesOf } = effObserve()
  const views = effViews()

  each(players, (ep, [, bp]) => {
    const view = views.get(ep)
    each(bodies, (e, [b]) => {
      const distance = distanceTo(bp, b)
      if (distance <= MAX_UPDATE_DISTANCE) {
        const priority = e === ep ? Infinity : 1 / distance
        view.update(ep, e, Body, changesOf(b), priority)
      }
    })
  })
}

const sysNetSend = () => {
  const send = effInterval()
  const views = effViews()
  const messages = effPlayerMessages()
  const messageBase = effMessage()

  each(effInsert(players), entity => spawn(msgBase, entity))
  each(effRemove(players), entity => destroy(msgBase, entity))
  each(effAttach(Body), (entity, body) => attach(msgBase, entity, body))
  each(effDetach(Body), entity => detach(msgBase, entity, Body))

  if (send) {
    each(players, ep => {
      const view = views.get(ep)
      const message = messages.get(ep)
      for (const e of view.take(ep, Body, MAX_UPDATE_BODIES)) {
        patch(message, utations.take(e, Body))
        view.clear(ep, e, Body)
      }
      send(message, ep)
      reset(message)
    })
  }
}

const sysResetChanges = () => {
  const observe = effObserve()
  each(bodies, (e, [b]) => observe.reset(b))
}
```
