+++
title = "Systems"
weight = 4
+++

A **system** is simply a function executed during each world tick. All game logic should live within systems.

## Game Logic

Each system should implement some subset of your game's logic. Ideally a system manages a small number of concerns. There is minimal performance overhead to having multiple small systems versus monolithic ones, and smaller systems are easier to read, test, and maintain.

Below is an example set of systems that could be found in a top-down ARPG.

| System           | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `sysAiEnemy`     | Enemy AI logic                                           |
| `sysAiCompanion` | Companion AI logic                                       |
| `sysInput`       | Sample mouse/keyboard input                              |
| `sysCombat`      | Transform controller input to combat actions             |
| `sysMovement`    | Transform controller input to movement actions           |
| `sysPhysics`     | Apply forces and step physics simulation                 |
| `sysPickups`     | Detect collisions with items and update player inventory |
| `sysRender`      | Render game                                              |
| `sysRenderUI`    | Render user interface                                    |
| ...              |                                                          |

### Registering a System

A system is a void function that accepts a `World` instance as its only parameter:

```ts
const sysAiEnemy = (world: World) => {}
```

Systems are registered with the world via the options passed to `createWorld`, or the `world.addSystem` method.

```ts
const sysPhysics = () => ...
const sysRender = () => ...
const world = createWorld({ systems: [sysPhysics] })

world.addSystem(sysRender)
```

When `world.tick()` is called, each system is executed in the order that it was registered.

Systems have a signature of `(world: World<T>) => void`, where the first argument is the world that is currently mid-tick. A single value can be passed to `world.tick(data)`, which is then available in each system via `world.state.currentTickData`. Often times this value holds the amount of time that has elapsed since the previous tick, but it can be any value.

The following is a world that will log the time elapsed since the last tick at around 60Hz:

```ts
const world = createWorld<number>({
  systems: [world => console.log(world.state.currentTickData)],
})

let previousTime = Date.now()

setInterval(() => {
  const currentTime = Date.now()
  const delta = currentTime - previousTime

  world.tick(delta)

  previousTime = currentTime
}, 1000 / 60)
```

```
> 16.66666666
> 16.66666666
> 16.66666666
```

<aside>
  <p>
    <strong>Tip</strong> — maintaining state using tick <code>data</code> is comparable to using global variables. Consider moving this state into a singleton component. Or, if you need inter-system communication, you can pass messages using topics, which are discussed in the <a href="/ecs/topics">Topics</a> section.
  </p>
</aside>

## Querying and Iteration

Systems query collections of entities and operate on their data to yield the next game state. These iterable collections are created using **queries** that specify a set of component types to query.

Depending on its archetype, an entity may be eligible for iteration by a system one tick, and ineligible the next. This is the cornerstone of ECS: modifying component makeup also modifies game behavior. In addition, the isolation of game logic into systems makes your game world easier to debug and provides a clear target for performance and unit tests.

Queries are created with the `createQuery` function, which takes a **selector** of component types.

```ts
import { createQuery } from "@javelin/ecs"

const qryBodies = createQuery(Position, Velocity)
```

A query is an iterable object that produces tuples of `(entity, Component[])` for entities that meet the selector's criteria.

There are two ways to iterate a query. The first (and fastest) way is to iterate the query directly with a `for..of` loop:

```ts
for (const [entities, [positions, velocities]] of qryBodies) {
  for (let i = 0; i < entities.length; i++) {
    positions[i].x += velocities[i].x
    positions[i].y += velocities[i].y
  }
}
```

This method of iteration leaks the implementation details of how components are stored in archetypes. An outer `for..of` loop iterates through each matching archetype, while an inner loop accesses components for each matching entity. If your game doesn't reach extremely high entity counts and you don't mind a 2-3x iteration performance hit, consider using the function form of a query:

```ts
qryBodies((e, [p, v]) => {
  p.x += v.x
  p.y += v.y
})
```

<aside>
  <p>
    <strong>Tip</strong> — most examples in the Javelin docs iterate queries using the <code>query()</code> syntax since it's a bit easier to read, but stick to the <code>for..of</code> approach if your game world holds many entities.
  </p>
</aside>

The order of component types in the query's selector will match the order of components in the query's results. That is, `createQuery(Position, Player)` will always yield tuples of components `(Position, Player)`:

```ts
world.spawn(component(Player), component(Position))
world.spawn(component(Position), component(Player))

const sysRender = () => {
  qryPlayers((e, [{ x, y }, { name }]) => {
    // render each player with a name tag
    drawSprite(sprites.player, x, y)
    drawText(name, x, y)
  })
}
```

### Query Caveats

The tuple of components yielded by queries is re-used each iteration. This means that you shouldn't store the results of a query for use later like this:

```ts
const sysStatusEffects = () => {
  const results = []
  qryShocked((e, components) => {
    results.push(components)
  })
  ...
}
```

Every index of `results` corresponds to the same array, which is the tuple of components attached to the entity of the last iteration. If you absolutely need to store components between queries (e.g. you are optimizing a nested query), you could push the components of interest into a temporary array, e.g.

```ts
const results = []
qryShocked((e, [a, b]) => {
  results.push([a, b])
})
```
