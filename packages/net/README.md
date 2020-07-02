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

const systems = []
const world = createWorld(systems)
const messageProducer = createMessageProducer({
  world,
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
  client.sendReliable(messageProducer.getInitialMessages())

const loop = () => {
  world.tick()

  const reliable = messageProducer.getReliableMessages()
  const unreliable = messageProducer.getUnreliableMessages()

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

const systems = []
const world = createWorld(systems)
const messageHandler = createMessageHandler({
  world,
})

const client = await server.connect()

// apply remote messages to local world
client.reliable.onMessage(messageHandler.applyMessage)
client.unreliable.onMessage(messageHandler.applyMessage)

// get the local representation of a remote entity
messageHandler.remoteToLocal.get(someRemoteEntityId)
```
