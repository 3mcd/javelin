# `javelin/ecs`

A TypeScript Entity-Component System (ECS) for Node and web browsers.

## The World

In traditional OOP game design, entity data and behavior exist on the same object. For example, you may have a `Player` class that exposes a `jump()` method, and a `health` attribute.

```js
const player = new Player()
// read the player's health
player.health
// apply force to launch player into the air
player.jump()
```

Data and behavior are separate concerns in an ECS. Game objects are replaced with **entities**. Entities don't encapsulate any data or behavior of their own, and are usually modeled as "bags" of **components**. Components are plain old objects that contain serializable fields and no methods.

In `javelin/ecs`, the **world** is the entry point to building a game. The relation between entities and components is managed by a world. A world can create and destroy entities, modify an entity's component composition, and execute **systems** to implement game behavior. But more on that later.

```js
import { createWorld } from "@javelin/ecs"

const world = createWorld()
```

## Entities

You can create an entity with the `world.create` method:

```js
const entity = world.create([...components])
```

This function takes an array of components that the entity will be initialized with, and returns the newly created entity.

> **Note** — While an an entity should be treated as an opaque value, it might be fun to know that they are just automatically incrementing integers, starting at `0`.

> **Note** — The world will store the specified components associated with the entity in a table with similar components. This makes iteration quick, as we'll see later.

You can also assign components to a pre-existing entity using the `world.insert` method:

```js
const entity = world.create([])
world.insert(entity, [...components])
```

> **Note** — `world.insert` is much slower than initializing the entity with components due to the underlying archetcture of component storage.

## Components

A component is just a plain object; unremarkable, other than a few reserved fields (all prefixed with an underscore):

- `_t` is a unique integer identifying the component's **type**. It is critical that component types are unique or your game will break quickly.
- `_e` references the **entity** the component is actively associated with. As of now, a component can only be associated with one entity.
- `_v` maintains the current **version** of the component, which is useful for change detection.

`_t` is the only required field when assigning components to an entity, new or otherwise.

```js
world.create([
  { _t: 1, x: 0, y: 0 }, // Position
  { _t: 2, x: 0, y: 0 }, // Velocity
])
```

A component with type `1` belonging to entity `5` that has been modified three times might look like:

```js
{
  _t: 1,
  _e: 5,
  _v: 3,
  // ...
}
```

It's strongly recommended to use the `createComponentFactory` helper to create factories to build your components.

```ts
import { createComponentFactory, number } from "@javelin/ecs"

const Position = createComponentFactory({
  type: 1,
  name: "pos",
  schema: {
    x: number,
    y: number,
  },
})
```

A component factory must be configured with a `type` and `name`. `type` must be a unique integer. `name` is used by the [devtools](https://github.com/3mcd/javelin/tree/master/packages/devtool) for help when debugging.

The shape of a component is described via the `schema` option. Currently, `array`, `number`, `string`, and `boolean` are the supported data types.

Components created via factory are automatically pooled; however, you must register the factory with the world so components are automatically released when their entities are destroyed.

```ts
const world = createWorld({ componentFactories: [Position] })
// OR
world.registerComponentFactory(Position)
```

Otherwise, you'll need to release pooled components manually with the `componentFactory.destroy` method. Registering component factories with your game world also provides better support in the [devtools](https://github.com/3mcd/javelin/tree/master/packages/devtool).

### Destroying entities

Entities can be removed via the `world.destroy` method:

```js
world.destroy(entity)
```

When an entity is destroyed, all of its components are automatically de-referenced.

```js
world.destroy(entity)
Position.destroy(position)
```

## Querying and iteration

In `javelin/ecs`, a system is just a function executed each simulation tick. Systems execute **queries** to access entities' components. Systems are registered with the world via the options passed to `createWorld`, or the `world.addSystem` method.

```js
const render = (dt: number, world: World) => {
  // ...
}

const world = createWorld({ systems: [render] })
// OR
world.addSystem(render)
```

Queries are created with the `createQuery` function, which takes one or more component types (or factories).

```js
const players = createQuery(Position, Player)
```

The query can then be executed for a given world:

```js
const render = (dt: number, world: World) => {
  for (const [position, player] of world.query(players)) {
    // render each player with a name tag
    draw(position, player.name)
  }
}
```

## Filtering and change detection

Queried components are readonly by default. A mutable copy of a component can be obtained via `mut(ComponentType)`.

```js
import { query, mut } from "@javelin/ecs"

const burning = query(mut(Health), Burn)

const applyDamage = (dt: number, world: World) => {
  for (const [health, burn] of world.query(burning)) {
    health.value -= burn.damagePerTick
  }
}
```

Components are versioned as alluded to earlier. `world.mut` simply increments the component's version. If you are optimizing query performance and want to conditionally mutate a component (i.e. you are using a generic query), you can manually call `world.mut(component)` to obtain a mutable reference, e.g.:

```js
import { query } from "@javelin/ecs"

const burning = query(Health, Burn)

const applyDamage = (dt: number, world: World) => {
  for (const [health, burn] of world.query(burning)) {
    if (!world.hasTag(health._e, Tags.Invulnerable)) {
      world.mut(health).value -= burn.damagePerTick
    }
  }
}
```

`changed` produces a filter that excludes entities whose components haven't changed since the entity was last iterated with the filter instance. This filter uses the component's version (`_v`) to this end.

```js
import { changed, query } from "@javelin/ecs"

// ...
const healthy = query(Health, mut(Player)).filter(changed(Health))

const cullEntities = () => {
  for (const [health, player] of world.query(healthy)) {
    // `health` has changed since last tick
    if (health <= 0) {
      world.destroy(health._e)
    }
  }
}
```

A query can take one or more filters as arguments to `filter`.

```js
query.filter(changed, awake, ...);
```

The ECS also provides the following filters

- `committed` ignores "ephemeral" entities, i.e. entities that were created or destroyed last tick
- `created` detects newly created entities
- `destroyed` detects recently destroyed entities
- `tag` isolates entities by tags, which are discussed below

## Tagging

Entities can be tagged with bit flags via the `world.addTag` method.

```js
enum Tags {
  Awake = 1,
  Dying = 2,
}

world.addTag(entity, Tags.Awake | Tags.Dying)
```

The `world.hasTag` method can be used to check if an entity has a tag. `world.removeTag` removes tags from an entity.

```js
world.hasTag(entity, Tags.Awake) // -> true
world.hasTag(entity, Tags.Dying) // -> true
world.removeTag(entity, Tags.Awake)
world.hasTag(entity, Tags.Awake) // -> false
```

`tag` produces a filter that will exclude entities which don't have the provided tag(s):

```js
enum Tags {
  Nasty = 2 ** 0,
  Goopy = 2 ** 1,
}

const nastyAndGoopy = createQuery(Player).filter(tag(Tags.Nasty | Tags.Goopy))

for (const [player] of world.query(nastyAndGoopy)) {
  // `player` belongs to an entity with Nasty and Goopy tags
}
```

## Common Pitfalls

### Storing query results

The tuple of components yielded by `world.query()` is re-used each iteration. This means that you can't store the results of a query for use later like this:

```js
const results = []

for (const s of world.query(shocked)) {
  results.push(s)
}

// Every index of `results` corresponds to the same array!
```

The same applies to `Array.from()`, or any other method that expands an iterator into another container. If you _do_ need to store components between queries (e.g. you are optimizing a nested query), you could push the components of interest into a temporary array, e.g.

```js
const applyStatusEffects = (dt: number, world: World) => {
  const shockedEnemies = []

  for (const [enemy] of world.query(shocked)) {
    shockedEnemies.push(enemy)
  }
}
```

Try nested queries before you prematurely optimize. Iteration is pretty fast thanks to Archetypes, and a nested query will probably perform fine.

### Filter state

A filter does not have access to the query that executed it, meaning it can't track state for multiple queries. For example, if two queries use the same `changed` filter, no entities will be yielded by the second query unless entities were created between the first and second queries.

```js
const moved = world.query(createQuery(Position).filter(changed))

for (const [position] of world.query(moved)) // 100 iterations
for (const [position] of world.query(moved)) // 0 iterations
```

The solution is to simply use a unique filter per query.

```js
const moved1 = world.query(createQuery(Position).filter(changed))
const moved2 = world.query(createQuery(Position).filter(changed))

for (const [position] of world.query(moved1)) // 100 iterations
for (const [position] of world.query(moved2)) // 100 iterations
```
