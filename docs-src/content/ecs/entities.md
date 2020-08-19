+++
title = "Entities"
weight = 3
+++

## Creating Entities

Entities are created using `world.spawn`. This method is a variadic function that accepts 0..n components and returns a newly created entity attached to those components.

```typescript
const player = { _t: 1, name: "elrond" }
const health = { _t: 2, value: 100 }
const entity = world.spawn(player, health)
```

<aside>
  <p>
    <strong>Note</strong> — although entities are simply auto-incrementing integers (starting at <code>0</code>), they should be treated as opaque values.
  </p>
</aside>

The tuple of components associated with an entity defines its **archetype**. The following code creates an entity of archetype `(1, 2)`. Components can be assigned to existing entities using `world.attach`, and removed from entities using `world.detach`.

```typescript
const input = { _t: 3, space: true }

// archetype: (1, 2) -> (1, 2, 3)
world.attach(entity, input)
world.tick()

// archetype: (1, 2, 3) -> (1, 2)
world.detach(entity, input)
world.tick()
```

<aside>
  <p>
    <strong>Note</strong> — using <code>world.attach</code> and <code>world.detach</code> to build entities is slower than <code>world.spawn(components)</code> because the entity's components must be relocated in memory each time its archetype changes.
  </p>
</aside>

## World Operations

In the example above, `world.tick()` was called each time entity was modified. Operations such as creating and destroying entities, as well as attaching and detaching components, are deferred until the next `world.tick()` call. This is done to improve the reliability of systems, so that systems never "miss" changes to entities, discussed in the [Filtering](/ecs/filtering) section. Each of these transactions is represented by a `WorldOp`.

You can review the types of operations in [world_op.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/world_op.ts). These objects are used in the Javelin network protocol to synchronize entities reliably between client and server.
