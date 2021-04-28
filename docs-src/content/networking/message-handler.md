+++
title = "Message Handler"
weight = 4
+++

While your application can decode and handle messages directly, a **message handler** provides some sane defaults for how instructions are extracted from messages and applied to a local world.

```ts
import { createMessageHandler } from "@javelin/net"
const messageHandler = createMessageHandler()
```

A message handler exposes a `push` method for inserting new messages, and a system that, when executed, will drain the message queue and apply the instructions encoded in each message to the world.

```ts
const world = createWorld({ systems: [messageHandler.system] })

channel.listen(message => messageHandler.push(message))
```

A message handler also exposes an effect that can be used to inspect the remote world state, a `Set` of patched entities, and a `Set` of updated entities.

```ts
const sysNet = () => {
  const {
    remote: { tick },
    patched,
    updated,
  } = messageHandler.effect()
  // ...
}
```
