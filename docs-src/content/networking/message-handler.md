+++
title = "Message Handler"
weight = 4
+++

A **message handler** enqueues network messages received from a remote source and applies their contained operations to a world.

```ts
import { createMessageHandler } from "@javelin/net"
const messageHandler = createMessageHandler()
```

Message handlers expose a `push` method for enqueuing new messages, and a system that drains the message queue and applies the operations encoded in each message to the world.

```ts
const world = createWorld({ systems: [messageHandler.system] })
// subscribe to remote messages
channel.listen(message => messageHandler.push(message))
```

They also also expose an effect that can be used to inspect the remote world state, a `Set` of patched entities, and a `Set` of updated entities.

```ts
const sysNet = () => {
  const {
    remote: { tick },
    patched, // entities patched last message
    updated, // entities updated last message
  } = messageHandler.useInfo()
  // ...

  qryBodies(e => {
    if (patched.has(e) || updated.has(e)) {
      interpolate(e)
    }
  })
}
```
