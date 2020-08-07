+++
title = "Hello World"
weight = 2
+++

## World

**Note** — the following chapters assume that you are familiar with basic ECS concepts discussed in the [opening section](ecs/).

A `World` is responsible for maintaining entities and executing systems. Most games will use a single world instance.

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

## Component Factories

The configuration object also accepts an array of component factories whose components will automatically be released back to an object pool when they are removed, or their entity is destroyed. We'll see how to create component factories in the [Components](/ecs/components) section.

```typescript
const world = createWorld({
    systems: [...],
    componentFactories: [
        Player,
        Body,
    ]
})
```

Component factories can be added after world initialization via the `world.registerComponentFactory` method:

```typescript
world.registerComponentFactory(Position)
```
