+++
title = "Systems"
weight = 4
+++

A **system** is simply a function executed during each world tick. All game logic should live within systems.

## Game Logic

Each system should implement some subset of your game's logic. Ideally a system manages a small number of concerns. There is minimal performance overhead to having multiple small systems versus monolithic ones, and smaller systems are easier to read, test, and maintain.

Below is an example set of systems that could be found in a top-down ARPG.

| System            | Description                                                  |
|-------------------|--------------------------------------------------------------|
| `sys_ai_enemy`      | Enemy AI logic                                               |
| `sys_ai_companions` | Companion AI logic                                           |
| `sys_input`         | Sample mouse/keyboard input                                  |
| `sys_combat`        | Transform controller input to combat actions                 |
| `sys_movement`      | Transform controller input to movement actions               |
| `sys_physics`       | Apply forces and step physics simulation                     |
| `sys_pickups`       | Detect collisions with items and update player inventory     |
| `sys_render`        | Render game                                                  |
| `sys_render_ui`     | Render user interface                                        |
| ...               |                                                              |

### Registering a System


A system is a void function that accepts a `World` instance as its only parameter:

```ts
const sys_ai_enemy = (world: World) => {}
```

Systems are registered with the world via the options passed to `createWorld`, or the `world.addSystem` method.

```typescript
const sys_physics = () => ...
const sys_render = () => ...
const world = createWorld({ systems: [sys_physics] })

world.addSystem(sys_render)
```

When `world.tick()` is called, each system is executed in the order that it was registered.

Systems have a signature of `(world: World<T>) => void`, where the first argument is the world that is currently mid-tick. A single value can be passed to `world.tick(data)`, which is then available in each system via `world.state.currentTickData`. Often times this value holds the amount of time that has elapsed since the previous tick, but it can be any value.

The following is a world that will log the time elapsed since the last tick at around 60Hz:

```typescript
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

--- output:
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

Queries are created with the `query` function, which takes a **selector** of component types.

```typescript
import { query } from "@javelin/ecs"

const players = query(Position, Player)
```

A query is a function that is executed with a world. This function returns an iterator that yields tuples of `(entity, Component[])` for entities that meet the selector's criteria.

The order of the components in the results matches the order of components types in the selector. That is, `query(Position, Player)` will yield tuples of components `(Position, Player)`, regardless of how the components are stored in an archetype.

```typescript
world.spawn(world.component(Player), world.component(Position))
world.spawn(world.component(Position), world.component(Player))

const sys_render = () => {
  for (const [entity, position, player] of players) {
    // render each player with a name tag
    draw(sprites.player, position, player.name)
  }
}
```

### Modifying State

In order to mutate game state you'll need access to the `World` that called the system.

The world that is currently executing a tick is passed as the system's first argument:

```ts
function sys_munch_doritos(world: World<number>) {
  console.log(world.state.currentTickData) // logs 0.1666666667
}

world.addSystem(sys_munch_doritos)
world.tick(1000 / 60)

--- output:
> 16.66666666
```

### Query Caveats

The tuple of components yielded by queries is re-used each iteration. This means that you shouldn't store the results of a query for use later like this:

```typescript
const results = []

for (const result of shocked) {
  results.push(result)
}
```

Every index of `results` corresponds to the same array, which is the tuple of components attached to the entity of the last iteration.

The same applies to `Array.from()`, or any other method that expands an iterator into another container. If you _do_ need to store components between queries (e.g. you are optimizing a nested query), you could push the components of interest into a temporary array, e.g.

```typescript
const sys_status_effects = () => {
  const results = []

  for (const [, ...components] of shocked) {
    results.push(components)
  }
}
```
