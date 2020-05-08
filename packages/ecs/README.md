# `@javelin/ecs`

A TypeScript Entity-Component System (ECS) for Node and web browsers.

## Primer

ECS is a pattern commonly used in game development to associate components (state) with stateless entities (game objects). Systems then operate on collections of entities of shared composition.

For example, a system could add a `Burn` component to entities with `Position` and `Health` components when their position intersects with a lava pit.

## Features

- **Performant**
  - Entities are organized by component makeup into Archetypes for fast iteration
  - Entities can be tagged with bit flags for quick filtering
- **Ergonomic**
  - Minimal API
  - No classes or inheritance
- **Unopinionated**
  - Leaves many opinions up to you, meaning it can be integrated with other packages or pre-existing projects

## Performance

Run `yarn perf` to run performance tests.

Example perf on 2018 MacBook Pro where 350k entities are iterated per tick at 60 FPS:

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

## Basics

### Entity and component creation

Entities are integers. Components are associated with entities by a container cleverly named `Storage`.

```ts
import { createStorage } from "@javelin/ecs"

const storage = createStorage()
```

Entities are created with the `storage.create()` method.

```ts
const entity = storage.create([
  { _t: 1, x: 0, y: 0 }, // Position
  { _t: 2, x: 0, y: 0 }, // Velocity
])
```

Components are simple JS objects other than a few reserved properties:

- `_t` is a unique integer identifying the component's type
- `_e` references the entity the component is actively associated with
- `_v` maintains the current version of the component, which is useful for change detection

A position component assigned to entity `5` that has been modified three times might look like:

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
const entity = storage.create([position])
```

Components created via factory are automatically pooled; however, you must manually release the component back to the pool when it should be discarded:

```ts
storage.destroy(entity)
Position.destroy(position)
```

`Storage` can do this automatically if you register the component factory via the `storage.registerComponentFactory` method.

```ts
storage.registerComponentFactory(Position)
storage.destroy(entity) // position automatically released
```

### Querying and iteration

The ECS has no concept of systems. A system is just the code in your program that executes queries and reads/writes component state.

Queries are created with the `createQuery` function, which takes one or more component types (or factories).

```ts
const players = createQuery(Position, Player)
```

The query can then be executed for a given storage (your game usually has one storage):

```ts
for (const [position, player] of players.run(storage)) {
  // render each player with a name tag
  draw(position, player.name)
}
```

### Filtering and change detection

As alluded to earlier, components are versioned. The version of a component can be incremented using the `storage.incrementVersion()` method, which just increments the component's `_v` property:

```ts
const burning = query(Health, Burn)

for (const [health, burn] of burning.run(storage)) {
  health.value -= burn.damagePerTick
  storage.incrementVersion(health)
}
```

A component's version can be useful when you want to query components that have changed since your game's last tick.

`createChangedFilter` produces a filter that excludes entities whose components haven't changed since the entity was last iterated with the filter instance. This filter uses the component's version (`_v`) to this end.

```ts
import { createChangedFilter, query } from "@javelin/ecs"

// ...
const healthy = query(Player, Health)
const changed = createChangedFilter(Health)

for (const [health] of healthy.run(storage, changed)) {
  // `health` has changed since last tick
}
```

A query can take one or more filters as arguments to `run`.

```ts
bodies.run(storage, changed, awake, ...);
```

The ECS also provides `createAddedFilter` to detect newly added entities, and `createTagFilter` to find tagged entities, which are discussed below.

### Tagging

Entities can be tagged with bit flags via the `storage.tag` method.

```ts
enum Tags {
  Awake = 1,
  Dying = 2,
}

storage.tag(entity, Tags.Awake | Tags.Dying)
```

The `storage.hasTag` method can be used to check if an entity has a tag. `storage.removeTag` removes tags from an entity.

```ts
storage.hasTag(entity, Tags.Awake) // -> true
storage.hasTag(entity, Tags.Dying) // -> true
storage.removeTag(entity, Tags.Awake)
storage.hasTag(entity, Tags.Awake) // -> false
```

`createTagFilter` produces a filter that will exclude entities which do not have the provided tag(s):

```ts
enum Tags {
  Nasty = 2 ** 0,
  Goopy = 2 ** 1,
}

const nastyAndGoopy = createTagFilter(Tags.Nasty | Tags.Goopy)

for (const [player] of createQuery(Player).run(storage, nastyAndGoopy)) {
  // `player` belongs to an entity with Nasty and Goopy tags
}
```

## Recipes

### Detecting removed entities

When interfacing with third-party libraries with their own state, you will often want to clean up library objects when an entity is removed. This is pretty easy to do with tags and queries.

```ts
enum Tag {
  Removing = 1,
}

const bodies = query(Body)
const removed = createTagFilter(Tag.Removing)
const p2BodiesByEntityId = {}

function physicsSystem() {
  for (const [body] of bodies.run(storage, removed)) {
    p2World.removeBody(p2BodiesByEntityId[body._e])
  }
}

const players = query(Body, Health)

function damageSystem() {
  for (const [body, health] of players.run(storage)) {
    if (health <= 0) {
      storage.addTag(body._e, Tag.Removing)
    }
  }
}
```

## Common Pitfalls

### Storing query results

The tuple of components yielded by `query.run()` is re-used each iteration. This means that you can't store the results of a query for use later like this:

```ts
const results = []

for (const r of query.run(storage)) {
  results.push(r)
}

// Every index of `results` corresponds to the same array!
```

The same applies to `Array.from()`, or any other method that expands an iterator into another container. If you _do_ need to store components between queries (e.g. you are optimizing a nested query), you could push the components of interest into a temporary array, e.g.

```ts
const positions = []

for (const [position] of query.run(storage)) {
  positions.push(position)
}
```

Try nested queries before you prematurely optimize. Iteration is pretty fast thanks to Archetypes, and a nested query will probably perform fine.

### Filter state

A filter does not have access to the query that executed it, meaning it can't track state for multiple queries. For example, if two queries use the same `changed` filter, no entities will be yielded by the second query unless entities were added between the first and second queries.

```ts
const changed1 = changed()

for (const [position] of query(Position).run(storage, changed1)) {
  // 100 iterations
}
// No new entities...
for (const [position] of query(Position).run(storage, changed1)) {
  // 0 iterations
}
```

The solution is to simply use a unique filter per query.

```ts
const changed1 = changed()
const changed2 = changed()

for (const [position] of query(Position).run(storage, changed1)) {
  // 100 iterations
}

for (const [position] of query(Position).run(storage, changed2)) {
  // 100 iterations
}
```
