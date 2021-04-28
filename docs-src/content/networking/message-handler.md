+++
title = "Message Handler"
weight = 4
+++

A **message handler** enqueues network messages applies their contained operations to a world.

```ts
import { createMessageHandler } from "@javelin/net"
const messageHandler = createMessageHandler()
```

A message handler exposes a `push` method for inserting new messages, and a system that, when executed, will drain the message queue and apply the instructions encoded in each message to the world.

```ts
const world = createWorld({ systems: [messageHandler.system] })

channel.listen(message => messageHandler.push(message))
```

They also also expose an effect that can be used to inspect the remote world state, a `Set` of patched entities, and a `Set` of updated entities.

```ts
const sysNet = () => {
  const {
    remote: { tick },
    patched, // entities patched last message
    updated, // entities updated last message
  } = messageHandler.effect()
  // ...

  qryBodies(e => {
    if (patched.has(e) || updated.has(e)) {
      interpolate(e)
    }
  })
}
```
