+++
title = "Systems"
weight = 4
+++

A **system** is simply a function executed during each world step. All game logic should live within systems.

## Game Logic

Each system should implement some subset of your game's logic. Ideally a system manages a small number of concerns. There is minimal performance overhead to having multiple small systems versus monolithic ones, and smaller systems are easier to read, test, and maintain.

Below is an example set of systems that could be found in a top-down ARPG.

| System        | Description                                              |
| ------------- | -------------------------------------------------------- |
| `enemyAI`     | Enemy AI logic                                           |
| `companionAI` | Companion AI logic                                       |
| `input`       | Sample mouse/keyboard input                              |
| `combat`      | Transform controller input to combat actions             |
| `movement`    | Transform controller input to movement actions           |
| `physics`     | Apply forces and step physics simulation                 |
| `pickups`     | Detect collisions with items and update player inventory |
| `render`      | Render game                                              |
| `renderUI`    | Render user interface                                    |
| ...           |                                                          |

### Registering a System

A system is a void function that accepts a `World<T>` instance as its only parameter:

```ts
const enemyAI = (world: World) => {}
```

Systems are registered with the world via the options passed to `createWorld`, or the `world.addSystem` method.

```ts
const physics = () => ...
const render = () => ...
const world = createWorld({ systems: [physics] })

world.addSystem(render)
```

Systems have a signature of `(world: World) => void`, where the only argument is the world that's currently mid-step. Calling `world.step()` will execute each system in the order that it was registered.

You may have noticed that `World<T>` is generic. `T` is a type that represents some data common to each step. Often times this value captures the amount of time elapsed since the previous step, but it can be any value. You can set this value via a single argument passed to `world.step(data: T)`. This value is assigned to `world.latestTickData` at the beginning of each step.

The following is a world that will log the time elapsed since the last step, 60 times per second:

```ts
const world = createWorld<number>()
world.addSystem(world => console.log(world.latestTickData))

let t1: number

setInterval(() => {
  const t2 = performance.now()
  world.step(t2 - (t1 ?? t2))
  t1 = t2
}, (1 / 60) * 1000)
```

```
> 16.66666666
> 16.66666666
> 16.66666666
```

## Querying and Iteration

Systems query iterable lists of entities and operate on their data to produce the next game state. These lists are called **queries**.

Depending on its archetype, an entity may be eligible for iteration by a system during one step, and ineligible the next. Querying is the cornerstone of ECS: modifying component makeup also modifies game behavior. In addition, the isolation of game logic into systems makes your game world easier to debug and provides a clear target for performance and unit tests.

Queries are created with the `createQuery` function, which accepts a one or more of component types. This list of component types is called a **selector**.

```ts
import { createQuery } from "@javelin/ecs"

const bodies = createQuery(Position, Velocity)
```

A query is an iterable object that produces tuples of `(entity, Component[])` for entities that meet the selector's criteria. There are two ways to iterate a query. The first (and fastest) way is to iterate the query directly with a `for..of` loop:

```ts
const physics = () => {
  for (const [entities, [positions, velocities]] of bodies) {
    for (let i = 0; i < entities.length; i++) {
      positions[i].x += velocities[i].x
      positions[i].y += velocities[i].y
    }
  }
}
```

Although fast, this method of iteration leaks the implementation details of how components are stored in archetypes. An outer `for..of` loop iterates through each matching archetype, while an inner loop accesses components for each matching entity. If your game doesn't reach extremely high entity counts and you don't mind a 2-3x iteration performance hit, consider using the function form of a query:

```ts
const physics = () =>
  bodies((e, [p, v]) => {
    p.x += v.x
    p.y += v.y
  })
```

<aside>
  <p>
    <strong>Tip</strong> — most examples in the Javelin docs iterate queries using <code>query(iteratee)</code> syntax since it's a bit easier to read, but stick to the <code>for..of</code> approach if your game world holds many entities.
  </p>
</aside>

### Binding Queries

By default, queries will resolve entities and components of the world that is currently mid-step. If you need to run a query against a specific world (i.e., outside of a system), you can bind a query to a specific world using the `bind` method:

```ts
// Always executes against `world`
bodies.bind(world)(e => {})
```

You can use a query's `test` method to check if an entity would match that query.

```ts
bodies.test(e) // -> true
```

### Result Ordering

The order of component types in a query's selector will match the order of components in the query's results. That is, `createQuery(Position, Player)` will always yield tuples of components `(Position, Player)`:

```ts
world.create(component(Player), component(Position))
world.create(component(Position), component(Player))

const render = () =>
  players((e, [{ x, y }, { name }]) => {
    // render each player with a name tag
    drawSprite(sprites.player, x, y)
    drawText(name, x, y)
  })
```

### Query Caveats

The tuple of components yielded by queries is re-used each iteration. This means that you shouldn't store the results of a query for use later like this:

```ts
const elements = () => {
  const results = []
  shocked((e, components) => {
    results.push(components)
  })
  ...
}
```

Every index of `results` references the same array, which is the tuple of components attached to the entity of the last iteration. If you absolutely need to store components between queries (e.g. you're optimizing a nested query), you could push the components of interest into a temporary array, e.g.

```ts
const results = []
shocked((e, [a, b]) => {
  results.push([a, b])
})
```
