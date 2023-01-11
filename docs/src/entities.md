# Entities

An entity identifies a discrete game unit. You can think of an entity as a pointer to a collection of components that can grow and shrink during gameplay. An entity can represent anything from a player or enemy, to a spawn point, or even a remotely connected client.

Javelin supports up to around one-million (2^20) active entities, and around four-billion (2^32) total entities over the lifetime of the game. Internally, entities are represented as unsigned integers. But they should be treated as opaque values to keep your code robust to API changes.

## Entity Creation

Entities are created using `world.create`. An entity can be created with zero or more components:

```ts
world.create()
```

Most often you will need to create entities from an initial set of components. This is accomplished with a type:

```ts
let Position = component<Vector2>()
let Velocity = component<Vector2>()
let Kinetic = type(Position, Velocity)

world.create(Kinetic, {x: 0, y: 0}, {x: 1, y: -1})
```

Component values may not be provided for tags during entity creation, since tags are stateless.

```ts
let Burning = tag()

world.create(type(Burning, Position), {x: 0, y: 0})
```

Components defined with a schema are auto-initialized if a value is not provided.

```ts
let Position = component({x: "f32", y: "f32"})

world.create(type(Position))
```

## Entity Reconfiguration

Components are added to entities using `world.add`.

```ts
world.add(entity, type(Velocity), {x: 1, y: -1})
world.add(entity, type(Burning, Position))
```

Components are removed from entities using `world.remove`.

```ts
world.remove(entity, Kinetic)
```

## Entity Deletion

Entities are deleted using `world.delete`.

```ts
world.delete(entity)
```

## Entity Transaction

Entity operations are deferred until the end of each step. Take the following example where a `systemB` downstream of `systemA` fails to locate a newly created entity within a single step.

```ts
game
  // systemA
  .addSystem(world => {
    world.create(Hippo)
  })
  // systemB
  .addSystem(world => {
    world.of(Hippo).each(hippo => {
      // (not called, even though a hippo was created)
    })
  })
  .step()
```

All changes made to entities are accumulated into a transction that is applied after the last system executes. This allows Javelin to performanly move changed entities within it's internal data structures at most one time per step. This behavior also reduces the potential for bugs where systems that occur early in the pipeline can "miss" entities that are created and deleted within the same step.
