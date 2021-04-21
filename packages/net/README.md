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

const sysPhysics: System = ({ observe }) => {
  each(bodies, (e, [b]) => {
    const bo = observe(b)
    bo.x += b.vx
    bo.y += b.vy
  })
}

const sysNetPrioritize = () => {
  const priorities = effPlayerPriorities()

  each(players, (e, [, bp]) => {
    const acc = priorites.get(e)
    each(bodies, (eb, [b]) => {
      const distance = distanceTo(bp, b)
      if (distance <= MAX_UPDATE_DISTANCE) {
        const priority = eb === e ? Infinity : 1 / distance
        acc.add(e, eb, Body, priority)
      }
    })
  })
}

const sysNetSend = () => {
  const send = effInterval()
  const messages = effPlayerMessages()
  const base = effMessage()

  effTransition(
    players,
    e => spawn(base, e),
    e => destroy(base, e),
  )
  effModify(
    Body,
    (e, b) => attach(base, e, b),
    e => detach(base, e, Body),
  )

  players(e => {})

  if (send) {
    players(e => {
      const view = views.get(e)
      const message = messages.get(e)

      copy(base, message)
      send(message, e)
      reset(message)
    })
    reset(base)
  }
}

const sysResetChanges = () => {
  const observe = effObserve()
  each(bodies, (e, [b]) => observe.reset(b))
}
```

```ts
each(onInsert(players), e => {
  const msg = createMessage()
  link(msg, msgBase)
  messages.set(e, msg)
}
```
