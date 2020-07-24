# `@javelin/net`

Networking utilities for Javelin ECS.

## Message Producer

Produce unreliable and reliable Javelin network protocol messages for a world.

- [maxUpdateSize=10](https://youtu.be/_mPzpv47zCg)
- [maxUpdateSize=100](https://youtu.be/718N4cmX_rY)
- [maxUpdateSize=1000](https://youtu.be/7W5L6WTksLY)

### Usage

```ts
import { createWorld } from "@javelin/ecs"
import { createMessageProducer } from "@javelin/net"

const world = createWorld({ ... })
const messageProducer = createMessageProducer({
  components: [
    // send components reliably when they change
    { type: Health },
    // send components unreliably by specifying a priority
    { type: Position, priority: 1 },
  ],
  // send unreliable updates 30 times a second
  updateInterval: (1 / 30) * 1000,
  // send a maximum of 1000 components per unreliable update
  updateSize: 1000,
})

const onClientConnect = client =>
  // send initial messages to new clients over reliable channel
  client.sendReliable(messageProducer.getInitialMessages(world))

const loop = () => {
  world.tick()

  const reliable = messageProducer.getReliableMessages(world)
  const unreliable = messageProducer.getUnreliableMessages(world)

  for (const client of clients) {
    client.sendReliable(reliable)
    client.sendUnreliable(unreliable)
  }
}
```

## Message Handler

Apply Javelin network protocol messages to a world.

### Usage

```ts
import { createWorld } from "@javelin/ecs"
import { createMessageHandler } from "@javelin/net"

const messageHandler = createMessageHandler()
const world = createWorld({
  systems: [messageHandler.system],
})

const client = await server.connect()

// apply remote messages to local world next tick
client.reliable.onMessage(messageHandler.push)
client.unreliable.onMessage(messageHandler.push)
```
