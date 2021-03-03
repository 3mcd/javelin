+++
title = "Filtering"
weight = 5
+++

It's often useful to query components that were added, removed, or modified. For example, you may want to know when a component is attached to, or detached from, an entity in order to notify a third-party library, or update another entity. You can use **filters** to narrow the results of a query.

## Reacting to Changes

Components detached during the current tick are excluded from query results by default. Imagine a system that detaches the `Body` component of entities when a player's health drops to zero. If detached components were always included, an entity whose `Body` was detached could continue to trigger collisions with other entities during the current tick, leading to unexpected behavior.

The result of a query can be narrowed using filters. Queries are filtered by wrapping one or more of the component types in a selector with a filter function, e.g:

```
query(Player, detached(Body))
```

### Attached

The `attached` filter will narrow a query to include only entities whose selected components were added last tick.

```typescript
import { attached } from "@javelin/ecs"

const queries = {
  attached: query(Player, attached(Body)),
}
const sys_physics = () => {
  for (const [entity, player, body] of queries.attached) {
    // `body` was attached to `entity` last tick
  }
}
```

### Detached

The `detached` filter will narrow a query to include only entities whose selected components were detached during the last tick.

```typescript
import { detached } from "@javelin/ecs"

const queries = {
  detached: query(Player, detached(Body))
}
const sys_physics = (world: World) => {
  for (const [entity, player, body] of queries.detached) {
    // `body` was removed from `entity` this tick OR last tick
  }
}
```

### Changed

The `changed` filter excludes entities whose components didn't change last tick. For a component to be eligible for filtering by `changed`, it must be modified using an observed copy returned by `world.getObservedComponent`. This is discussed in more detail in the [Change Detection](/ecs/change-detection) chapter.

```typescript
import { changed, query } from "@javelin/ecs"

const healthy = query(changed(Health), Player))
const sys_physics = (world: World) => {
  for (const [entity, health, player] of healthy) {
    // `health` has changed since last tick
    if (health.value <= 0) {
      world.detach(entity, health)
    }
  }
}
```

### Custom Filters

You can create a custom filter with the `createComponentFilter` function. Custom filters can clean up logic within your systems and facilitate code re-use, although they may be slightly less performant than embedding the logic directly inside the system.

```typescript
import { createComponentFilter } from "@javelin/ecs"

const killed = createComponentFilter(() => (health: ComponentOf<typeof Health>) =>
  health.value <= 0,
)

const queries = {
  killed: query(killed(Health)),
}

const sys_physics = (world: World) => {
  for (const [entity, health] of queries.killed) {
    world.detach(entity, health)
  }
}
```
