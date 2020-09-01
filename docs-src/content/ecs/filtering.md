+++
title = "Filtering"
weight = 5
+++

## Change Detection

Sometimes it's useful to capture changes made to entities and their components. For example, it may be useful to know when a component is attached to (or detached from) an entity in order to notify a third-party library, or update another component in your game.

By default, query results will exclude detached components, and include newly attached components alongside an entity's existing components.

<aside>
  <p><strong>Note</strong> — components detached during the current tick are excluded from query results. Imagine a system that detaches the <code>Body</code> component of entities when a player's health drops to zero. If detached components were always included, an entity whose <code>Body</code> was detached could continue to trigger collisions with other entities during the current tick, leading to unexpected behavior.</p>
</aside>

The result of a query can be narrowed using filters. Queries are filtered by wrapping one or more of the component types in a selector with a filter function, e.g:

```
query(Player, detached(Body))
```

### Attached

The `attached` filter will narrow a query to include only entities whose the selected components were added **last tick**.

```typescript
import { attached } from "@javelin/ecs"

const attachedBodies = query(Player, attached(Body))
const system = (world: World) => {
  for (const [entity, [player, body]] of attachedBodies(world)) {
    // `body` was attached to `entity` last tick
  }
}
```

### Detached

The `detached` filter will narrow a query to include only entities whose selected components were detached either **last tick** or the **current tick**.

```typescript
import { detached } from "@javelin/ecs"

const detachedBodies = query(Player, detached(Body))
const system = (world: World) => {
  for (const [entity, [player, body]] of detachedBodies(world)) {
    // `body` was removed from `entity` this tick OR last tick
  }
}
```

### Changed

The `changed` filter excludes entities whose components didn't change last tick. For a component to be eligible for filtering by `changed`, it must be modified using an observed copy returned by `world.getObservedComponent`. This is discussed in more detail in the [Change Detection](/ecs/change-detection) chapter.

```typescript
import { changed, query } from "@javelin/ecs"

const healthy = query(changed(Health), Player))
const system = (world: World) => {
  for (const [entity, [health, player]] of healthy(world)) {
    // `health` has changed since last tick
    if (health.value <= 0) {
      world.detach(entity, health)
    }
  }
}
```

### Custom Filters

You can create a custom filter with the `createComponentFilter` function.

```typescript
import { createComponentFilter } from "@javelin/ecs"

const dead = createComponentFilter(() => (health: ComponentOf<typeof Health>) =>
  health.value <= 0,
)
const killed = query(dead(Health))
const system = (world: World) => {
  for (const [entity, [health]] of killed(world)) {
    world.detach(entity, health)
  }
}
```
