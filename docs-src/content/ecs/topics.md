+++
title = "Topics"
weight = 7
+++

## Inter-System Communication

Sometimes it's useful for a system to trigger behavior in a different system. For example, you might have a physics system that wraps a third-party library whose methods you'd like to expose to other parts of your game.

Let's say you want to apply an impulse to a physics body when a player jumps so it gains some momentum in a direction. One way of doing this is to model the operation as a component.

```typescript
type Impulse = {
  x: number,
  y: number,
}
```

When you want to apply a impulse to an entity, you could insert an `Impulse` component on the current tick, and remove it on the following tick.

```typescript
// player input system
for (const [entity] of jumping(world)) {
  world.attach(entity, Impulse.create())
}

for (const [entity, [, impulse]] of playersWithImpulse(world)) {
  world.detach(entity, impulse)
}
```

```typescript
// physics system
for (const [entity, [impulse]] of playersWithImpulse(world)) {
  const body = getBodyByEntity(entity)
  physicsEngine.applyImpulseLocal(body, impulse)
}
```

This will work fine for a small game; however, adding and removing components in an archetypal ECS can be slow. It's also a little nasty to have to clean up after each operation for what should be fire-and-forget as far as the player input system is concerned.

### Topics

Topics are simple FIFO buffers that hold on to messages between ticks that can be used to signal events or expose an RPC-like API to a system.

Topics are created using the `createTopic<T>()` function, where `T` is the type (e.g. a union type) of message managed by the topic. The `createTopic` function is defined in [topic.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/topic.ts).

```typescript
import { createTopic } from "@javelin/ecs"

// ("impulse", entity: number, velocity: [x: number, y: number])
type ImpulseCommand = ["impulse", number, [number, number]]

const physicsTopic = createTopic<ImpulseCommand>()
```

Messages are enqueued using the `topic.push()` method.

```typescript
const message: ImpulseCommand = ["impulse", 23, [0, 2]]
topic.push(message)
```

Messages are unavailable until the `topic.flush()` method is called. It's recommended to flush the topics in your main game loop, after calling `world.tick`.

```typescript
const tick = () => {
  world.tick()
  physicsTopic.flush()
}
```

Messages can then be read using a for..of loop.

```typescript
import { physicsTopic } from "./physics_topic"

const physicsSystem = (world: World) => {
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
    <strong>Note</strong> — System registration order matters when using <code>pushImmediate</code>. Since the messages will be thrown away at the end of the tick, any systems upstream from the one that used <code>pushImmediate</code> will never have the opportunity to read the message.
  </p>
</aside>

```typescript
topic.pushImmediate(["impulse", 24, [0, 2]])
```
