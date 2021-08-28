+++
title = "World"
weight = 2
+++

<aside>
  <p>
    <strong>Tip</strong> — the following chapters assume that you're familiar with basic ECS concepts discussed in the <a href="/ecs">opening section</a>.
  </p>
</aside>

**Worlds** are responsible for maintaining entities and executing systems. They expose a `step()` method which moves the world forward in time as well as methods to manage entities and their components.

A world is created using the `createWorld` function defined in [world.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/world.ts).

```ts
import { createWorld } from "@javelin/ecs"

const world = createWorld()
```

## Systems

Systems in Javelin are simple functions that can be registered with a world to be executed each tick. They are discussed at length in the [Systems](/ecs/systems) section.

There are two ways to register a system with a world. Either use the `systems` property in the options object passed to `createWorld`:

```ts
createWorld({
  systems: [physics, render],
})
```

or after a world is created using the `world.addSystem()` method:

```ts
const lazySystem = import("./systems/lazy")
world.addSystem(lazySystem)
```

## Maintenance

### Snapshots

`world.createSnapshot()` produces a JSON-serializable snapshot of a world's entities and components. You can use the snapshot to seed a new world with entities later:

```ts
const snapshot = worldA.createSnapshot()
const worldB = createWorld({ snapshot })
```

### Reset

Use `world.reset()` to completely reset a world. This method will clear all entity data and release components back to their object pool.
