+++
title = "Topics"
weight = 7
+++

## Inter-System Communication

Sometimes you need a way of dispatching a message to be handled by a different system without the hassle of setting up a singleton component. Topics are simple FIFO buffers that hold on to messages between ticks that can be used to signal events or expose an RPC-like API to a system.

Topics are created using the `createTopic<T>()` function, where `T` is types of messages that can be accepted by the topic. The `createTopic` function is defined in [topic.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/topic.ts).

```typescript
import { createTopic } from "@javelin/ecs"

type PhysicsCommand = ["jump", number]

const physicsTopic = createTopic<PhysicsCommand>()
```

Messages are enqueued using the `topic.push()` method.

```typescript
topic.push(["jump", 23])
```

Messages are unavailable until the `topic.flush()` method is called. This means, by default, new messages are not readable until the next tick. It's recommended to flush the topics in your main game loop, after calling `world.tick`.

```typescript
const tick = () => {
  world.tick()
  physicsTopic.flush()
}
```

Messages are then read using a simple `for..of` loop.

```typescript
import { physicsTopic } from "./physics_topic"

// third-party physics engine
const physicsEngine = new PhysicsEngine()
const physicsSystem = (world: World) => {
  for (const command of physicsTopic) {
    if (command[0] === "jump") {
      physicsEngine.jump(physicsEngine.getBodyForEntity(command[1]))
    }
  }

  // ...
}
```

Sometimes you want messages to be processed as quickly as possible. If you want a message to be iterable during the current tick, you can use `topic.pushImmediate`.

```typescript
topic.pushImmediate(["jump", 24])
```

**Note** — keep in mind that the order that systems are registered and executed in matters when using `topic.pushImmediate`.
