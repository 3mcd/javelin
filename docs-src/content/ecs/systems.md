+++
title = "Systems"
weight = 4
+++

## Implementing Game Logic

A system is just a function executed during each world tick. All game logic should live within systems.

### Registering a system

Systems are registered with the world via the options passed to `createWorld`, or the `world.addSystem` method.

```typescript
const hello = () => console.log("hello")
const world = createWorld({ systems: [hello] })
// OR
world.addSystem(hello)
```

Systems have a signature of `(world: World<T>, data: T) => void`, where `world` is the world that is currently executing it, and `data` is the single argument (if any) passed into the tick method, i.e. `world.tick(data)`. Often times `data` contains the amount of time that has elapsed since the previous tick, but it can be any value.

When `world.tick` is called, each system is executed in the order that it was registered.

The following is a world that will log the time elapsed since the last tick at around 60Hz:

```typescript
const world = createWorld()
world.addSystem((world, dt) => console.log(dt))

let previousTime = Date.now()

setInterval(() => {
  const currentTime = Date.now()
  const delta = currentTime - previousTime

  world.tick(delta)

  previousTime = currentTime
}, 1000 / 60)
```

The output of the above program looks something like:

```typescript
16.66666666
16.66666666
16.66666666
```

<aside>
  <p>
    <strong>Note</strong> — maintaining state using tick <code>data</code> is comparable to using global variables. Consider moving this state into a singleton component. Or, if you need inter-system communication, you can pass messages using topics, which are discussed in the <a href="/ecs/topics">Topics</a> section.
  </p>
</aside>

## Querying and Iteration

Systems query collections of entities and operate on their data to yield the next game state. These iterable collections are created using **queries** that define an archetype (or sub-archetype) to query by. Depending on its archetype, an entity may be eligible for iteration by a system one tick, and ineligible the next.

This is the cornerstone of ECS that enables runtime composition. Adding and removing components also adds and removes behavior. In addition, the isolation of game logic into systems makes your game world easier to debug and provides a clear target for performance and unit tests.

Queries are created with the `query` function, which takes a **selector** of component types.

```typescript
import { query } from "@javelin/ecs"

const players = query(Position, Player)
```

A query is a function that is executed with a world. This function returns an iterator that yields tuples of `(entity, Component[])` for entities that meet the selector's criteria.

The order of the components in the results matches the order of components types in the selector. That is, `query(Position, Player)` will yield tuples of components `(Position, Player)`, regardless of how the components are stored in an archetype.

```typescript
world.create([Player.create(), Position.create()])
world.create([Position.create(), Player.create()])

const render = (world: World, dt: number) => {
  for (const [entity, [position, player]] of players(world)) {
    // render each player with a name tag
    draw(sprites.player, position, player.name, dt)
  }
}
```

### Query caveats

The tuple of components yielded by queries is re-used each iteration. This means that you shouldn't store the results of a query for use later like this:

```typescript
const results = []

for (const [, components] of shocked(world)) {
  results.push(components)
}
```

Every index of `results` corresponds to the same array, which is the tuple of components attached to the entity of the last iteration.

The same applies to `Array.from()`, or any other method that expands an iterator into another container. If you _do_ need to store components between queries (e.g. you are optimizing a nested query), you could push the components of interest into a temporary array, e.g.

```typescript
const applyStatusEffects = (dt: number, world: World) => {
  const shockedEnemies = []

  for (const [, components] of shocked(world)) {
    shockedEnemies.push(...components)
  }
}
```
