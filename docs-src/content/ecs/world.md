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

## Registering Systems

There are two ways to register a system. Either use the `systems` property in the options object passed to `createWorld`:

```ts
createWorld({
  systems: [physics, render],
})
```

or use the `world.addSystem()` method:

```ts
const lazySystem = import("./systems/lazy")
world.addSystem(lazySystem)
```

## Finding Components

Entity data is generally accessed using iterable [queries](/ecs/systems/#querying-and-iteration). However, queries only locate entities who meet certain criteria. This makes it difficult to write conditional logic based on the presence of a component. For example, you may want to apply damage to all entities that match `(Health, Burn)`, but only if the entity doesn't have an `Invulnerable` component.

`world.tryGet` attempts to locate a component of an entity by component type, returning `null` if not found:

```ts
if (world.tryGet(entity, Invulnerable) === null) {
  health.value -= burn.valuePerTick
}
```

`world.get` will throw an error if the component is not found, which can be used to assert a relationship between an archetype and another component type.

```ts
// an entity of (Health, Burn) should always have a position
world.get(entity, Position)
```

## Cleanup

### Snapshots

`world.getSnapshot()` takes a snapshot of a world's entities and components. You can use the snapshot to seed a new world with entities later:

```ts
const snapshot = worldA.getSnapshot()
const worldB = createWorld({ snapshot })
```

### Reset

Use `world.reset()` to completely reset a world. This method will clear all entity and component data, as well as release components back to their object pool.
