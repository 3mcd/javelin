# What is Javelin?

Javelin is an [Entity Component System](https://github.com/SanderMertens/ecs-faq#what-is-ecs) (ECS) framework for TypeScript and JavaScript. It draws inspiration from other ECS frameworks like [Bevy](https://bevyengine.org/) and [Flecs](https://www.flecs.dev/flecs/) to provide an ergonomic, performant, and interoperable way of creating games in JavaScript.

## Features

Systems with reactive entity queries.

```ts
let lootSystem = () => {
  world.query(Player).each((player, playerBox) => {
    world.query(Loot).each((loot, lootBox) => {
      // (pick up loot bag)
    })
  })
}
```

A scheduler with run criteria, ordering constraints, and system groups.

```ts
let weatherEnabled = (world: j.World) => {
  return world.getResource(Config).weatherEnabled
}
app
  .addSystem(shootSystem)
  .addSystem(lootSystem, j.after(shootSystem))
  .addSystem(weatherSystem, null, weatherEnabled)
  .addSystemToGroup(j.Group.Late, renderSystem)
```

A type system used to create, add, and remove sets of components from entities.

```ts
let Transform = j.type(Position, Rotation, Scale)
let Mesh = j.type(Geometry, Material)
let Player = j.type(Transform, Mesh)

world.create(Player)
```

Enum components used to safeguard entity composition and implement state machines.

```ts
let PlanetType = j.slot(Gas, Rock)
// Error: An entity can have at most one component for a given slot
world.create(j.type(PlanetType(Gas), PlanetType(Rock)))
```

Entity relationships with built-in support for heirarchies.

```ts
let parent = world.create()
let child = world.create(j.Childquery(parent))
world.delete(parent) // also deletes `child`
```

And much more! Move to the next chapter to learn how to install Javelin.
