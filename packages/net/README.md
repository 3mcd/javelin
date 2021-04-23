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
const dynamic = createQuery(Body)

const sysPhysics: System = ({ observe }) => {
  dynamic.forEach((e, [b]) => {
    const bo = observe(b)
    bo.x += b.vx
    bo.y += b.vy
  })
}

const createClient = () => ({
  producers: {
    [Channel.Reliable]: createMessageProducer(),
    [Channel.Unreliable]: createMessageProducer({
      maxByteLength: 1000,
    }),
  },
  channels: {
    [Channel.Reliable]: createChannel(),
    [Channel.Unreliable]: createChannel(),
  },
})

const sysNetClientState = () => {
  const clients = effClients()

  effMonitor(
    players,
    e => {
      clients[e] = createClient()
    },
    e => {
      delete clients[e]
    },
  )
}

const sysNetSend = () => {
  const base = effProducer()
  const send = effInterval()
  const clients = effClients()

  effMonitor(
    dynamic,
    e => base.spawn(e),
    e => base.destroy(e),
  )
  effTrigger(
    Body,
    (e, b) => base.attach(e, b),
    e => base.detach(e, Body),
  )

  players.forEach((e, [pb]) => {
    const producer = clients[e].producers[Channel.Unreliable]
    dynamic.forEach((eb, [b]) =>
      producer.patch(eb, observe.changesOf(b), getPriority(pb, b)),
    )
  })

  if (send) {
    players.forEach(e => {
      const {
        [Channel.Unreliable]: producerU,
        [Channel.Reliable]: producerR,
      } = producers
      const {
        [Channel.Unreliable]: channelU,
        [Channel.Reliable]: channelR,
      } = channels
      producerR.insert(base)
      channelU.send(producerU.take())
      channelR.send(producerR.take())
    })
    base.reset()
  }
}
```
