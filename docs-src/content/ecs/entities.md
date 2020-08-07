+++
title = "Entities"
weight = 3
+++

## Creating Entities

Entities are created using `world.create`. This method accepts an array of components and returns a newly created entity. The tuple of components associated with an entity defines its **archetype**. The following code creates an entity of archetype `(1)`.

```typescript
const player = { _t: 1, name: "elrond" }
const entity = world.create([player])
```

**Note** — although entities are simply auto-incrementing integers (starting at `0`), they should be treated as opaque values.

Components can be assigned to existing entities using `world.insert`, and removed from entities using `world.remove`.

```typescript
const input = { _t: 2, space: true }

world.insert(entity, [input]) // archetype -> (1, 2)
world.remove(entity, [input]) // archetype -> (1)
```

**Note** — `world.insert` and `world.remove` are much slower than initializing an entity with components because the entity's components must be relocated in memory when its archetype changes. If you need to add and remove components, try to do it on the order of < 10^3 entities per tick.

## World Operations

Operations such as creating, inserting, removing, and destroying entities are deferred until the next `world.tick()` call. This is done to improve the reliability of systems (i.e. systems never "miss" changes entities, discussed later). Each of these transactions is represented by a `WorldOp`.

You can review the type definitions of all potential operations in [world_op.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/world_op.ts). These objects are used in the Javelin network protocol to synchronize entities reliably between client<>server.
