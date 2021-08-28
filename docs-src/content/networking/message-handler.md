+++
title = "Message Handler"
weight = 4
+++

A **message handler** enqueues network messages received from a remote source and applies their contained operations to a world.

## Handling Messages

A message handler is created using the `createMessageHandler` function:

```ts
import { createMessageHandler } from "@javelin/net"
const messageHandler = createMessageHandler()
```

Message handlers expose a `push` method for enqueuing new messages along with a system that drains the message queue and applies the operations encoded in each message to the world.

```ts
const world = createWorld({ systems: [messageHandler.system] })
// subscribe to remote messages
channel.listen(message => messageHandler.push(message))
```

## Reacting To Changes

A message handler exposes an effect that can be used to inspect the remote world state, a `Set` of patched entities, and a `Set` of updated entities.

```ts
const sysNet = () => {
  const {
    remote: { tick },
    updated, // entities updated last message
  } = messageHandler.useInfo()
  // ...

  qryBodies(e => {
    if (updated.has(e)) {
      interpolate(e)
    }
  })
}
```
