+++
title = "Message Producer"
weight = 3
+++

A **message producer** lets you build messages between ticks, prioritize updates to certain component types, and divide messages based on certain criteria (like a maximum size).

## Building Messages

Message producers maintain a queue of messages. New messages are enqueued when the most current message reaches a maximum byte length (default `Infinity`). The maxmum byte length is specified using the `options` argument to `createMessageProducer`.

The easiest way to consume a message producer in a system is to wrap an instance in a ref:

```ts
const useProducer = createRef(
  () => createMessageProducer({ maxByteLength: 1000 }), // limit each message to 1kb
)
```

Message producers expose methods that correspond to each of the operations described in the [Javelin protocol](./networking/../protocol.md).

```ts
const producer = useProducer()
producer.attach(e, [c])
producer.update(e, [c])
producer.detach(e, [b])
producer.destroy(e)
```

The `take` method will dequeue a message, or null, if no changes were written.

```ts
const message = producer.take() // Message | null
```

`useMonitor` can be used to conveniently write attach and destroy operations.

```ts
const net = () => {
  const { attach, destroy, take } = useProducer().value
  // write attach/destroy operations for players
  useMonitor(players, attach, destroy)
  // every 50ms
  if (useInterval(1 / 20) * 1000) {
    // dequeue and encode a message
    const encoded = encode(take())
    // and send it to each client
    send(encoded)
  }
}
```

### Component Model

`take` accepts a single boolean parameter that instructs the message producer to include a serialized component model in the next message. This must be done at least once, usually in the first message sent to a client. For example:

```ts
const getInitialMessage = () => {
  producer.attach(...)
  // ...
  return producer.take(true) // include component model
}
```

The component model does not have to be included with each message. `MessageHandler` will re-use the last encountered component model if a message is not self-describing.

### Sending Entity Changes

Below is example that demonstrates how you might write attach/detach operations while an entity continues to match a query:

```ts
const players = createQuery(Player)
const burning = createQuery(Player, Burn)
const net = () => {
  const { destroy, attach, detach, take } = useProducer().value
  // spawn newly created players on client
  useMonitor(players, attach, destroy)
  // a burn effect may be attached/detached frequently, so we control the
  // synchronization with a separate monitor
  useMonitor(
    burning,
    (e, [, b]) => b && attach(e, b),
    (e, [, b]) => b && detach(e, b),
  )

  if (useInterval(1 / 20) * 1000) {
    send(encode(take()))
  }
}
```

## Updating Components

### Update

Two strategies exist for synchronizing component state: updates and patches. Updates send the entire component state, which is simple to implement but uses more bandwidth.

```ts
transforms((e, [t]) => producer.update(e, [t]))
```

`MessageHandler` simply uses `Object.assign` to apply component updates in a message to their local counterparts.

### Patch

A patch operation effeciently serializes fields contained in a [`ChangeSet`](./ecs/change-detection.md) component.

```ts
import { set } from "@javelin/track"
trackedTransforms((e, [t, changes]) => {
  set(t, changes, "x", 3)
  set(t, changes, "y", 4)
})
```

A patch operation can then be written to a message producer `patch`:

```ts
import { reset } from "@javelin/track"
trackedTransforms((e, [t, changes]) => {
  producer.patch(e, changes)
  reset(changes)
})
```
