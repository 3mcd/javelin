+++
title = "Protocol"
weight = 2
+++

The Javelin protocol is a collection of functions used to build compact messages that can be handled either by your application directly, or by helpful utilities like [`MessageProducer`](/networking/message-producer) or [`MessageHandler`](/networking/message-handler).

## Messages

The protcol is has a single message type with multiple parts. A message may contain the following information:

- current tick number
- component model (excluded by default)
- attached components
- updated components (full)
- patched components (deltas)
- detached components
- destroyed entities

<aside>
  <p>
    <strong>Tip</strong> — a single message that encapsulates all operations keeps the protocol small and easy to use and understand. However, creating and sending messages is not automated: the logic for deciding what gets sent when (and to whom) is fully the responsibility of your application.
  </p>
</aside>

### Building Messages

Messages are created using `createMessage`:

```ts
import { createMessage } from "@javelin/net"

const message = createMessage()
```

They are operated on via functions called **message writers** that correspond to various ECS instructions, like `attach`, `update` and `destroy`. These functions push the data of the operation into a temporary buffer that is read when the message is ultimately encoded. You may accumulate as many operations as you'd like on a message:

```ts
import { component } from "@javelin/ecs"
import { attach, update } from "@javelin/net"
import { Body } from "./components"

attach(message, 1, [component(Player)])
update(message, 99, [updatedBody])
destroy(message, 2)
```

A message can be serialized into an `ArrayBuffer` using `encode`. Messages are deserialized with `decodeMessage`, which executes callbacks for each operation encoded in the message.

```ts
import { encode } from "@javelin/net"

const encoded = encode(message)
channel.send(encoded)

// ... somewhere on the client:
import { decodeMessage } from "@javelin/net"

decodeMessage(encoded, {
  onSpawn(e, components) {
    world.attach(e, components)
  },
})
```

Once you're done with a message, it can be reset and re-used between ticks:

```ts
import { reset } from "@javelin/net"

reset(message)
```

## Message Writers

### `attach(message: Message, entity: Entity, components: Component[]): void`

Write an attach operation for an entity and one or more components.

### `update(message: Message, entity: Entity, components: Component[]): void`

Write an update operation for an entity and one or more components.

### `patch(message: Message, entity: Entity, changes: InstanceOfSchema<typeof ChangeSet>): void`

Write the changes stored in a [`ChangeSet`](/ecs/change-detection) for an entity.

```ts
const sysPatchBodies = () =>
  players((entity, [body, changes]) => {
    const message = getEntityMessage(entity)
    patch(message, entity, changes)
  })
```

### `detach(message: Message, entity: Entity, components: Component[]): void`

Write a detach operation for an entity and one or more components.

### `destroy(message: Message, entity: Entity): void`

Write a destroy operation for an entity.
