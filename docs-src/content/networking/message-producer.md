+++
title = "Message Producer"
weight = 3
+++

A **message producer** lets you build messages between ticks, prioritize updates to certain component types, and divide messages based on certain criteria (like a maximum size).

## Producing Messages

The easiest way to consume a message producer in a system is to wrap an instance in a ref:

```ts
const useProducer = createRef(() =>
  createMessageProducer({ maxByteLength: 1000 }),
)
```

Below is the simplest example of using a message producer to spawn entities that match a query:

```ts
const sysNet = () => {
  const { spawn, destroy, take } = useProducer().value
  // write spawn/destroy operations for players
  useMonitor(players, spawn, destroy)
  // every 50ms
  if (useInterval(1 / 20) * 1000) {
    // dequeue and encode a message
    const encoded = encodeMessage(take())
    // and send it to each client
    send(encoded)
  }
}
```

Below is an extension of the above example that demonstrates how you might write attach/detach operations while an entity continues to match a query:

```ts
const players = createQuery(Player)
const burning = createQuery(Player, Burn)
const sysNet = () => {
  const { spawn, destroy, attach, detach, take } = useProducer().value
  // spawn newly created players on client
  useMonitor(players, spawn, destroy)
  // a burn effect may be attached/detached frequently, so we control the
  // synchronization with a separate monitor
  useMonitor(
    burning,
    (e, [, b]) => b && attach(e, b),
    (e, [, b]) => b && detach(e, b),
  )

  if (useInterval(1 / 20) * 1000) {
    send(encodeMessage(take()))
  }
}
```

## Patching

TODO

## Per-Client Filtering

TODO
