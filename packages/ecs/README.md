# `@javelin/ecs`

A simple, performant ECS for TypeScript.

## Features

- **Performant**
  - Entities are organized based on their component makeup into Archetypes. This helps performance since the core model of ECS is to iterate over entities with like components.
- **Ergonomic**
  - Minimal API.
  - Data-oriented design: no classes or inheritance.
  - Tag entities with bit flags for basic filtering.
- **Unopinionated**
  - Leaves many decisions up to you. For example, a helper for creating component instances is provided, but not required for library use.

## Basics

Entities are integers. Components are associated with entities within a container cleverly named `Storage`.

```ts
import { createStorage } from "@javelin/ecs"

const storage = createStorage()
```

Entities are created with the `storage.insert()` method.

```ts
const entity = storage.insert([
  { _t: 1, x: 0, y: 0 }, // Position
  { _t: 2, x: 0, y: 0 }, // Velocity
])
```

Components are simple JS objects other than a few reserved properties:

- `_t` is a unique integer identifying the component's type
- `_e` references the entity the component is actively associated with
- `_v` maintains the current version of the component, which is useful for change detection

A position component associated with entity `5` and has been modified three times might look like:

```ts
{ _t: 1, _e: 5, _v: 3, x: 123.4, y: 567.8 }
```

The `createComponentFactory` helper is provided to make component creation easier.

```ts
import { createComponentFactory, number } from "@javelin/ecs"

const Position = createComponentFactory({
  type: 1,
  schema: {
    x: number,
    y: number,
  },
})

const position = Position.create()
const entity = storage.insert(position)

storage.remove(entity)
Position.destroy(p)
```

Components created via factory are automatically pooled, but you must manually release the component back to the pool when it is discarded. The ECS can do this automatically if you register the component factory via the `storage.registerComponentFactory` method.

The ECS has no concept of systems. A system is just the code in your program that executes queries and reads/writes component state.

```ts
import { createQuery } from "@javelin/ecs"

const positions = createQuery(Position)
const bodies = createQuery(Position, Velocity)

// physics system
for (const [position, velocity] of bodies.run(storage)) {
  position.x += velocity.x
  position.y += velocity.y
}

// render system
for (const [position] of positions.run(storage)) {
  draw(position)
}
```

Components are versioned. Versions of a component can be incremented using the `storage.incrementVersion()` method (which just increments the component's `_v` property):

```ts
for (const [position, velocity] of bodies.run(storage)) {
  position.x += velocity.x
  position.y += velocity.y
  storage.incrementVersion(position)
}
```

Queries can be filtered. The `changed` filter will exclude entities when the provided components haven't changed since the entity was last iterated.

```ts
import { changed, query } from "@javelin/ecs"

// ...
const positions = query(Position)
const positionChanged = changed(Position)

for (const [p] of positions.run(storage, positionChanged)) {
  // p has changed since last tick
}
```

## Performance

Run `yarn perf` to run performance tests.

Example perf on 2018 MacBook Pro where 350k entities are iterated at over 60 FPS:

```
========================================
perf_storage
========================================
entities      | 300000
components    | 4
queries       | 4
ticks         | 100
iter_tick     | 353500
avg_tick      | 13.7ms
========================================
perf_storage_pooled
========================================
entities      | 300000
components    | 4
queries       | 4
ticks         | 100
iter_tick     | 353500
avg_tick      | 14.62ms
```
