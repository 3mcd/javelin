+++
title = "Systems"
weight = 4
+++

## Implementing Game Logic

A system is just a function executed during each world tick. Systems look up entities and operate on their data to yield the next game state.

All game logic should live within systems. Systems operate on dynamically growing and shrinking sets of entities that are queried by their archetype (or sub-archetype). This means that, depending on its archetype, an entity may be eligible for iteration by a system one tick, and ineligible the next.

This is the cornerstone of ECS that enables runtime composition. Adding and removing components also adds and removes behavior. In addition, the isolation of game logic into systems makes your game world easier to debug and provides a clear target for performance and unit tests.

### Registering a system

Systems are registered with the world via the options passed to `createWorld`, or the `world.addSystem` method.

```typescript
const hello = () => console.log("hello")
const world = createWorld({ systems: [hello] })
// OR
world.addSystem(hello)
```

Systems have a signature of `(world: World<T>, data: T) => void`, where `world` is the world that is currently executing it, and `data` is the single argument (if any) passed into the tick method, i.e. `world.tick(data)`.

When `world.tick` is called, each system is executed in the order that it was registered. Often times `data` contains the amount of time that has elapsed since the previous tick, but it can be any value.

The following is an example of a "game" that will log the time elapsed since the last tick at around 60Hz.

```typescript
const world = createWorld()
world.addSystem(console.log)

let previousTime = Date.now()

setInterval(() => {
  const currentTime = Date.now()
  world.tick(currentTime - previousTime)
  previousTime = currentTime
}, 1000 / 60)
```

The output of the above program might look something like:

```
World { }, 16.66666666
World { }, 16.66666666
World { }, 16.66666666
```

<aside>
  <p>
    <strong>Note</strong> — maintaining state using tick <code>data</code> is an antipattern since it is injected from outside of your game world. Consider moving this state into a singleton component. Or, if you need inter-system communication, you can pass messages using topics, which are discussed in the <a href="/ecs/topics">Topics</a> section.
  </p>
</aside>

## Querying and Iteration

Systems may execute **queries** to access entities and their components. Queries are created with the `query` function, which takes a **selector** of component types.

```typescript
import { query, select } from "@javelin/ecs"

const players = query(select(Position, Player))
```

The `query` function returns a function that is then executed with a world. This function returns an iterator that yields tuples of components that belong to entities that meet the selector's criteria. The order of the components in the results match the order of components types in the selector. That is, the selector `select(Position, Player)`, will return a tuple of components `(Position, Player)`, regardless of the order in which the components are stored.

```typescript
const render = (world: World, dt: number) => {
  for (const [position, player] of players(world)) {
    // render each player with a name tag
    draw(position, player.name, dt)
  }
}
```

### Query caveats

The tuple of components yielded by queries is re-used each iteration. This means that you can't store the results of a query for use later like this:

```typescript
const results = []

for (const s of shocked(world)) {
  results.push(s)
}
```

Every index of `results` corresponds to the same array!

The same applies to `Array.from()`, or any other method that expands an iterator into another container. If you _do_ need to store components between queries (e.g. you are optimizing a nested query), you could push the components of interest into a temporary array, e.g.

```typescript
const applyStatusEffects = (dt: number, world: World) => {
  const shockedEnemies = []

  for (const [enemy] of shocked(world)) {
    shockedEnemies.push(enemy)
  }
}
```
