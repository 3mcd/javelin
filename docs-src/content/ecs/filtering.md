+++
title = "Filtering"
weight = 5
+++

The result of a query can be narrowed using filters. A query is filtered using the rest parameters of `query`.

```typescript
import { created } from "@javelin/ecs"

const createdBodies = query(select(Body), created)
```

The `changed` filter excludes entities whose components haven't changed since the entity was last encountered by the filter in a query. This filter uses the component's version (`_v`) to this end.

```typescript
import { changed, query } from "@javelin/ecs"

const healthy = query(select(Health, Player), changed(Health))

const cullEntities = (world: World) => {
  for (const [health, player] of healthy(world)) {
    // `health` has changed since last tick
    if (health <= 0) {
      world.destroy(health._e)
    }
  }
}
```

`query(selector, ...filters)` accepts multiple filters:

```typescript
query(selector, changed, awake, ...);
```

Javelin also provides the following filters:

- `committed` ignores entities that were created or destroyed last tick
- `created` detects newly created entities
- `destroyed` detects recently destroyed entities
- `tag` isolates entities by tags, which are discussed in the [Tagging](/ecs/tagging) section
