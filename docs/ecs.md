# `javelin/ecs`

A Entity-Component System (ECS) for Node and web browsers, written in TypeScript.

## Installation

```sh
npm i @javelin/ecs
```

## The World

In traditional game development, entity data and behavior typically exist on the same object. For example, you may have a `Player` class that exposes a `jump()` method and a `health` attribute.

```js
const player = new Player()
// read the player's health
player.health
// apply force to launch player into the air
player.jump()
```

Data and behavior are separate concerns in an ECS. The high-cohesion game object is replaced with **entities**, **components**, and **systems**. Entities don't encapsulate any data or behavior of their own, and are usually modeled as "bags" of components. Components are plain old objects that contain data and no methods. Systems implement game behavior. But more on that later.

In `javelin/ecs`, the relation between entities and components is managed by a **world**. A world can create and destroy entities, modify an entity's component composition, and execute systems.

A world is created using `createWorld`:

```js
import { createWorld } from "@javelin/ecs"

const world = createWorld()
```

## Entities

Entities are created using `world.create`:

```js
const entity = world.create([...components])
```

This method accepts a tuple of components that the entity will be initialized with, and returns the newly created entity.

> **Note** — While entities should be treated as opaque value (kind of like a pointer), they are just auto-incrementing integers, starting at `0`.

Components can be assigned to existing entities using `world.insert`:

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

```js
import { createComponentFactory, number } from "@javelin/ecs"

const Position = createComponentFactory({
  type: 1,
  name: "position",
  schema: {
    x: number,
    y: number,
  },
})
```

A component factory is configured with a type and name, where `type` is a unique integer and `name` is a unique string. The component factory's name is used within [`javelin/devtools`](https://github.com/3mcd/javelin/tree/master/packages/devtool) to help with visual coherence.

Components created via factory are automatically pooled; however, you must register the factory with the world so components are released back to the pool when their entity is destroyed:

```js
const world = createWorld({ componentFactories: [Position] })
// OR
world.registerComponentFactory(Position)
```

Otherwise, you'll need to release pooled components manually with the `componentFactory.destroy` method.

### Destroying entities

Entities can be removed via the `world.destroy` method:

```js
world.destroy(entity)
```

When an entity is destroyed, all of its components are automatically de-referenced.

## Querying and Iteration

In `javelin/ecs`, a system is just a function executed each atomic "step" of the simulation. All game logic should live within systems. An FPS game might consist of systems that handle physics, user input and movement, projectile collisions, and player inventory. The isolation of game logic into systems makes your game world easy to debug and provides a clear target for performance and unit tests.

Systems are registered with the world via the options passed to `createWorld`, or the `world.addSystem` method:

```js
const hello = () => console.log("hello")
const world = createWorld({ systems: [hello] })
// OR
world.addSystem(hello)
```

Each system is executed in the order it was registered when `world.tick` is called. `world.tick` takes a single argument which is passed to each system. Often times this will be the amount of time that has elapsed since the previous tick. The following is an example of a "game" that will log the time elapsed since the last tick at around 60Hz.

```js
const world = createWorld()
world.addSystem(console.log)

let previousTime = Date.now()

setInterval(() => {
  const currentTime = Date.now()
  world.tick(currentTime - previousTime)
  previousTime = currentTime
}, (1 / 60) * 1000)
```

Systems may execute **queries** to access entities and their components. Queries are created with the `createQuery` function, which takes one or more component types/factories. This tuple of component types is called a **selector**.

```js
const players = createQuery(Position, Player)
```

The query can then be executed for a given world. The query returns an iterator that yields tuples of components that belong to entities that meet the query's criteria. The components are presented the same order that the corresponding component type was presented in the selector.

```js
const render = (world: World, dt: number) => {
  for (const [position, player] of world.query(players)) {
    // render each player with a name tag
    draw(position, player.name)
  }
}
```

## Change Detection

Queried components are readonly by default, and you must be explicit if you want a mutable reference. This is done to ensure that the ECS can detect changes to components. A mutable reference to a component can be obtained via `mut`.

```js
import { query, mut } from "@javelin/ecs"

const burning = query(mut(Health), Burn)

const applyDamage = (dt: number, world: World) => {
  for (const [health, burn] of world.query(burning)) {
    health.value -= burn.damagePerTick
  }
}
```

Components are versioned as alluded to earlier. `world.mut` simply increments the component's version. If you are optimizing query performance and want to conditionally mutate a component, you can manually call `world.mut(component)`, e.g.:

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

## Filters

The result of a query can be narrowed using filters. A query is filtered using the `query.filter` method.

`javelin/ecs` exports a filter called `changed` which will exclude entities whose components haven't changed since the entity was last encountered by the filter in a query. This filter uses the component's version (`_v`) to this end.

```js
import { changed, query } from "@javelin/ecs"

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

`query.filter` will accept multiple filters:

```js
query.filter(changed, awake, ...);
```

The ECS also provides the following filters

- `committed` ignores entities that were created or destroyed last tick.
- `created` detects newly created entities.
- `destroyed` detects recently destroyed entities.
- `tag` isolates entities by tags, which are discussed below.

## Tagging

Entities can be tagged with bit flags via `world.addTag`:

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

## Gotchas

### Query results

The tuple of components yielded by `world.query()` is re-used each iteration. This means that you can't store the results of a query for use later like this:

```js
const results = []

for (const s of world.query(shocked)) {
  results.push(s)
}
```

Every index of `results` corresponds to the same array!

The same applies to `Array.from()`, or any other method that expands an iterator into another container. If you _do_ need to store components between queries (e.g. you are optimizing a nested query), you could push the components of interest into a temporary array, e.g.

```js
const applyStatusEffects = (dt: number, world: World) => {
  const shockedEnemies = []

  for (const [enemy] of world.query(shocked)) {
    shockedEnemies.push(enemy)
  }
}
```

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

## Examples

https://runkit.com/emcd/javelin-ecs
