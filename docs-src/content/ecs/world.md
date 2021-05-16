+++
title = "World"
weight = 2
+++

<aside>
  <p>
    <strong>Tip</strong> — the following chapters assume that you're familiar with basic ECS concepts discussed in the <a href="/ecs">opening section</a>.
  </p>
</aside>

**Worlds** are responsible for maintaining entities and executing systems. They expose a methodto step the world forward in time, methods for managing entities and their components, and events that trigger when the state of the ECS changes.

A world is created using the `createWorld` function defined in [world.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/world.ts). `createWorld` accepts a config object that, at minimum, defines an array of systems that the world should execute each tick.

```ts
import { createWorld } from "@javelin/ecs"

const world = createWorld({
  systems: [() => console.log("Tick!")],
})
```

Systems can also be registered after a world is initialized using the `world.addSystem` method:

```ts
world.addSystem(() => console.log("Tock!"))
```

Calling `world.tick()` will process operations (like adding, removing, updating entities) that occurred during the previous tick. Then, all systems will be executed in the order that they were registered.

```ts
setInterval(world.tick, 1000)
```

More on systems later in the [Systems](/ecs/systems) section!

## Finding Components

Components are generally accessed using iterable [queries](/ecs/systems/#querying-and-iteration). However, queries only locate entities who meet each of the selector's criteria. This makes it difficult to write conditional logic based on the presence of a component. For example, you may want to apply damage to all entities that match `(Health, Burn)`, but only if the entity doesn't have an `Invulnerable` component.

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

`world.snapshot()` takes a snapshot of a world's entities and components. You can use the snapshot to seed a new world with entities later:

```ts
const snapshot = worldA.snapshot()
const worldB = createWorld({ snapshot })
```

### Reset

Use `world.reset()` to completely reset a world. This method will clear all entity and component data, releasing pooled components along the way.
