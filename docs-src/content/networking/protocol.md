+++
title = "Protocol"
weight = 2
+++

The Javelin networking protocol is an unopinionated set of tools that provides the means to synchronize Javelin worlds over your network transport of choice.

## Messages

This package is not very feature-rich by design. It doesn't handle acknowledgements, retries, or buffering (i.e. a jitter buffer). The "protocol" is really just a collection of functions used to build compact messages that can be handled either by your application directly, or by helpful utilities like `MessageBuilder` or `MessageHandler`.

Currently, the Javelin protocol doesn't control any aspect of your networking layer, meaning it can work with either unreliable transports (WebRTC, WebTransport), reliable transports (WebSockets), or a combination of both. The only requirement is that your transport must support binary data (e.g. ArrayBuffers).

### First Contact

Messages are simple objects.

```ts
import { createMessage } from "@javelin/net"

const message = createMessage()
```

They have no methods and are operated on using functions exported by the `net` package.

```ts
import { component } from "@javelin/ecs"
import { spawn } from "@javelin/net"
import { Body } from "./components"

spawn(message, 1, [component(Body)])
```

They can be reset and re-used between ticks for optimal memory usage.

```ts
import { reset } from "@javelin/net"

reset(message)
```

A message can be serialized into an `ArrayBuffer` using `encodeMessage`. Messages are deserialized with `decodeMessage`, which executes callbacks for each operation encoded in the message.

```ts
import { encodeMessage, decodeMessage } from "@javelin/net"
import world from "./world"

const encoded = encodeMessage(message)

decodeMessage(encoded, {
  onSpawn(e, components) {
    world.spawn(e, components)
  },
})
```

## Functions

### `spawn(message: Message, entity: Entity, components: Component[]): void`

Spawn an entity.

### `attach(message: Message, entity: Entity, components: Component[]): void`

Attach one or more components to an entity.

```ts
attach(message: Message, entity: Entity, components: Component[])
```

update(message: Message, entity: Entity, components: Component[])
patch(message: Message, entity: Entity, changes: ObserverChangeSet)
detach(message: Message, entity: Entity, components: Component[])
destroy(message: Message, entity: Entity)

```

```
