+++
title = "Hello World"
weight = 2
+++

<aside>
  <p>
    <strong>Note</strong> — the following chapters assume that you are familiar with basic ECS concepts discussed in the <a href="/ecs">opening section</a>.
  </p>
</aside>

## World

A `World` is responsible for maintaining entities and executing systems.

Worlds are created using the `createWorld` function defined in [world.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/world.ts). `createWorld` accepts a config object that, at minimum, defines an array of systems that the world should execute each tick.

```typescript
import { createWorld } from "@javelin/ecs"

const world = createWorld({
  systems: [() => console.log("Tick!")],
})
```

Systems can also be registered after a world is initialized using the `world.addSystem` method:

```typescript
world.addSystem(() => console.log("Tock!"))
```

Calling `world.tick()` will process operations that occurred during the previous tick such as adding, removing, updating entities. Then, all systems will be executed in the order that they were registered.

```typescript
setInterval(world.tick, 1000)
```

More on systems later in the [Systems](/ecs/systems) section!
