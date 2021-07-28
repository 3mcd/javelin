# `@javelin/net`

Networking protocol and utilities for Javelin ECS.

## Overview

Define schema using specialized data types.

```ts
const Body = {
  collisionMask: uint8,
  position: {
    x: float64,
    y: float64,
  },
}
```

Serialize ECS operations and data into `ArrayBuffer`s for transport from server->client.

```ts
const producer = createMessageProducer()
producer.attach(entity, body)
producer.detach(entity, spectate)
socket.send(producer.take())
```

Deserialize and apply messages on the client.

```ts
const handler = createMessageHandler()
world.addSystem(handler.system)
socket.on("message", event => handler.push(event.data))
```

## Docs

Read the [networking docs](https://javelin.games/networking/) to get started.
