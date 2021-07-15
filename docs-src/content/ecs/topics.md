+++
title = "Topics"
weight = 7
+++

Systems are typically **pure**, as they only read/modify the components of queried entities. However, as your game grows, you may want a system to trigger behavior in a different system. For example, you may write a physics system that wraps a third-party library whose methods you'd like to expose to other physics-interested systems.

**Topics** facilitate a way to do this without resorting to global state, unlike global [effects](/ecs/effects).

## Inter-System Communication

Let's say you want to apply an impulse to a physics body when a player jumps so it gains some momentum in a direction. One way of doing this is to model the operation as a component.

```ts
const Impulse = {
  x: number,
  y: number,
}
```

When you need to apply a impulse to an entity, you insert an `Impulse` component on the current tick, and remove it on the following tick.

```ts
const sysInput = ({ attach, detach }: World) => {
  qryJumping(entity => attach(entity, component(Impulse)))
  qryWithImpulse((entity, [impulse]) => detach(entity, impulse))
}

const sysPhysics = () => {
  qryWithImpulse((entity, [impulse]) => {
    const body = getBodyByEntity(entity)
    physicsEngine.applyImpulseLocal(body, impulse)
  })
}
```

This will work fine for a small game; however, there are a couple of problems with this approach as you scale to more complex games:

1. Adding and removing components in an archetypal ECS is slow
2. Your physics system must wait until the next tick to detect the newly attached impluse component

### Topics

Topics are simple FIFO buffers that hold on to messages between ticks that can be used to signal events or expose an RPC-like API to a system.

Topics are created using the `createTopic<T>()` function, where `T` is the type (e.g. a union type) of message managed by the topic. The `createTopic` function is defined in [topic.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/topic.ts).

```ts
import { createTopic, Entity } from "@javelin/ecs"

type ImpulseCommand = [type: "impulse", entity: Entity, force: [number, number]]

const physicsTopic = createTopic<ImpulseCommand>()
```

Messages are enqueued using the `topic.push()` method.

```ts
const message: ImpulseCommand = ["impulse", 23, [0, 2]]
physicsTopic.push(message)
```

Messages are unavailable until the `topic.flush()` method is called. You can call `flush()` manually, or you can configure your world to do it automatically with the `topics` option:

```ts
createWorld({
  topics: [physicsTopic],
  ...
})
```

Messages can then be read using a for..of loop.

```ts
import { physicsTopic } from "./physics_topic"

const sysPhysics = () => {
  for (const command of physicsTopic) {
    if (command[0] === "impulse") {
      const body = getBodyByEntity(command[1])
      physicsEngine.applyImpulseLocal(body, command[2])
    }
  }
}
```

### Immediate Processing

Sometimes messages should be handled as quickly as possible, like when processing user input. `topic.pushImmediate` will push a message into the topic for immediate processing.

<aside>
  <p>
    <strong>Tip</strong> — System registration order matters when using <code>pushImmediate</code>. Since the messages will be thrown away at the end of the tick, any systems upstream from the one that used <code>pushImmediate</code> will never have the opportunity to read the message.
  </p>
</aside>

```ts
physicsTopic.pushImmediate(["impulse", 24, [0, 2]])
```
