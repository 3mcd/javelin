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

## Basics

### Entity and component creation

Entities are integers. Components are associated with entities inside of a `World`.

```ts
import { createWorld } from "@javelin/ecs"

const world = createWorld()
```

Entities are created with the `world.create` method.

```ts
const entity = world.create([
  { _t: 1, x: 0, y: 0 }, // Position
  { _t: 2, x: 0, y: 0 }, // Velocity
])
```

Components are just plain objects; unremarkable, other than a few reserved properties:

- `_t` is a unique integer identifying the component's **type**
- `_e` references the **entity** the component is actively associated with
- `_v` maintains the current **version** of the component, which is useful for change detection

A position component assigned to entity `5` that has been modified three times might look like:

```ts
{ _t: 1, _e: 5, _v: 3, x: 123.4, y: 567.8 }
```

Entities can be removed (and all components subsequently de-referenced) via the `world.destroy` method:

```ts
world.destroy(entity)
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
const entity = world.create([position])
```

Components created via factory are automatically pooled; however, you must manually release the component back to the pool when it should be discarded:

```ts
world.destroy(entity)
Position.destroy(position)
```

`World` can do this automatically if you register the component factory via the `world.registerComponentFactory` method.

```ts
world.registerComponentFactory(Position)
world.destroy(entity) // position automatically released
```

### Querying and iteration

A system is just a function executed each simulation tick. Systems execute queries to access entities' components.

Queries are created with the `createQuery` function, which takes one or more component types (or factories).

```ts
const players = createQuery(Position, Player)
```

The query can then be executed for a given world:

```ts
for (const [position, player] of world.query(players)) {
  // render each player with a name tag
  draw(position, player.name)
}
```

### Filtering and change detection

Queried components are readonly by default. A mutable copy of a component can be obtained via `world.mut(entity)`.

```ts
const burning = query(Health, Burn)

for (const [health, burn] of world.query(burning)) {
  world.mut(health).value -= burn.damagePerTick
}
```

Components are versioned as alluded to earlier. `world.mut` simply increments the component's `_v` property. `createChangedFilter` produces a filter that excludes entities whose components haven't changed since the entity was last iterated with the filter instance. This filter uses the component's version (`_v`) to this end.

```ts
import { createChangedFilter, query } from "@javelin/ecs"

// ...
const healthy = query(Player, Health).filter(createChangedFilter(Health))

for (const [health] of world.query(healthy)) {
  // `health` has changed since last tick
}
```

A query can take one or more filters as arguments to `filter`.

```ts
query.filter(changed, awake, ...);
```

The ECS also provides `createAddedFilter` to detect newly created entities, `createDestroyedFilter` to detect recently destroyed entities, and `createTagFilter` to isolate entities by tags, which are discussed below.

### Tagging

Entities can be tagged with bit flags via the `world.addTag` method.

```ts
enum Tags {
  Awake = 1,
  Dying = 2,
}

world.addTag(entity, Tags.Awake | Tags.Dying)
```

The `world.hasTag` method can be used to check if an entity has a tag. `world.removeTag` removes tags from an entity.

```ts
world.hasTag(entity, Tags.Awake) // -> true
world.hasTag(entity, Tags.Dying) // -> true
world.removeTag(entity, Tags.Awake)
world.hasTag(entity, Tags.Awake) // -> false
```

`createTagFilter` produces a filter that will exclude entities which do not have the provided tag(s):

```ts
enum Tags {
  Nasty = 2 ** 0,
  Goopy = 2 ** 1,
}

const nastyAndGoopy = createQuery(Player).filter(
  createTagFilter(Tags.Nasty | Tags.Goopy),
)

for (const [player] of world.query(nastyAndGoopy)) {
  // `player` belongs to an entity with Nasty and Goopy tags
}
```

## Common Pitfalls

### Storing query results

The tuple of components yielded by `world.query()` is re-used each iteration. This means that you can't store the results of a query for use later like this:

```ts
const results = []

for (const s of world.query(shocked)) {
  results.push(s)
}

// Every index of `results` corresponds to the same array!
```

The same applies to `Array.from()`, or any other method that expands an iterator into another container. If you _do_ need to store components between queries (e.g. you are optimizing a nested query), you could push the components of interest into a temporary array, e.g.

```ts
const shocked = []

for (const [enemy] of world.query(shocked)) {
  shocked.push(enemy)
}
```

Try nested queries before you prematurely optimize. Iteration is pretty fast thanks to Archetypes, and a nested query will probably perform fine.

### Filter state

A filter does not have access to the query that executed it, meaning it can't track state for multiple queries. For example, if two queries use the same `changed` filter, no entities will be yielded by the second query unless entities were added between the first and second queries.

```ts
const moved = world.query(createQuery(Position).filter(changed()))

for (const [position] of world.query(moved)) // 100 iterations
for (const [position] of world.query(moved)) // 0 iterations
```

The solution is to simply use a unique filter per query.

```ts
const moved1 = world.query(createQuery(Position).filter(changed()))
const moved2 = world.query(createQuery(Position).filter(changed()))

for (const [position] of world.query(moved1)) // 100 iterations
for (const [position] of world.query(moved2)) // 100 iterations
```

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
