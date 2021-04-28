+++
title = "Message Producer"
weight = 3
+++

A **message producer** provides the means to build messages over time, prioritize updates to certain component types, and partion messages by size.

Below is a simple example of using a message producer to spawn entities that match the `players` query, and destroy them when the no longer match:

```ts
const producer = createMessageProducer()
const sysNet = () => {
  effMonitor(
    qryPlayers,
    (e, components) => producer.spawn(e, components),
    e => producer.destroy(e),
  )
}
```

```ts
const sysNet = () => {
  effTrigger(Body, (e, b) => {
    if (qryPlayers.test(e)) {
      producer.attach(e, [b])
    }
  })
}
```
