+++
title = "Hello World"
weight = 2
+++

## World

A `World` is responsible for maintaining entities and executing systems. Most games will use a single world instance.

Worlds are created using the `createWorld` function defined in [world.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/world.ts). `createWorld` takes a configuration object which may optionally contains an array of systems that the world should execute each tick.

```typescript
import { createWorld } from "@javelin/ecs";

const world = createWorld({
  systems: [() => console.log("Tick!")],
});
```

Systems can be added after a world is initialized using the `world.addSystem` method:

```typescript
world.addSystem(() => console.log("Tock!"));
```

Calling `world.tick()` will process operations that occurred during the previous tick such as adding, removing, updating entities. Then, all systems will be executed in the order that they were registered.

```typescript
setInterval(world.tick, 1000);
```

More on systems in the [Systems](/ecs/systems) chapter!

## Component Factories

The configuration object also accepts an array of component factories whose components will automatically be released back to an object pool when they are removed, or their entity is destroyed. We'll see how to create component factories in the [Components](/ecs/components) chapter.

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
world.registerComponentFactory(Position);
```
