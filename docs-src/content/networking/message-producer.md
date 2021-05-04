+++
title = "Message Producer"
weight = 3
+++

A **message producer** lets you build messages between ticks, prioritize updates to certain component types, and divide messages based on certain criteria (like a maximum size).

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
  // only spawn player on client with Player component
  useMonitor(
    players,
    (e, [p]) => spawn(e, p),
    (e, [p]) => destroy(e),
  )
  // a separate monitor updates clients' players' Burn components since a burn
  // effect may be attached/detached frequently
  useMonitor(
    burning,
    (e, [, b]) => attach(e, b),
    (e, [, b]) => detach(e, b),
  )

  if (useInterval(1 / 20) * 1000) {
    send(encodeMessage(take()))
  }
}
```

A query's `select` method can be used to clean up the callbacks provided to `useMonitor` by configuring the query to yield only the specified component type(s) in the results:

```ts
const players = createQuery(Player).select(Player)
const burning = createQuery(Player, Burn).select(Burn)
const sysNet = () => {
  // ...
  useMonitor(players, spawn, destroy)
  useMonitor(burning, attach, detach)
  // ...
}
```
