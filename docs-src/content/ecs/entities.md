+++
title = "Entities"
weight = 4
+++

Entities are abstract buckets of components that represent higher-order objects in your game. They are strictly defined by their component makeup, and do not contain any data or methods themselves.

## Entity Management

### Creating entities

Entities are created using `world.spawn`. This method accepts 0..n components and returns a newly created entity attached to those components.

```typescript
const player = { type: 1, name: "elrond" }
const health = { type: 2, value: 100 }
const entity = world.spawn(player, health)
```

<aside>
  <p>
    <strong>Note</strong> — although entities are simply auto-incrementing integers (starting at <code>0</code>), they should be treated as opaque values.
  </p>
</aside>

### Modifying entities

The vector of components associated with an entity defines its **archetype**. The previous code example would create an entity of archetype `(1, 2)`. Components can be assigned to existing entities using `world.attach`, and removed from entities using `world.detach`. The following example modifies an entity of archetype `(1, 2)` to `(1, 2, 3)`, and back to `(1, 2)`:

```typescript
const input = { type: 3, space: true }

// archetype: (1, 2) -> (1, 2, 3)
world.attach(entity, input)
world.tick()

// archetype: (1, 2, 3) -> (1, 2)
world.detach(entity, input)
world.tick()
```

<aside>
  <p>
    <strong>Note</strong> — using <code>world.attach</code> and <code>world.detach</code> to build entities is slower than <code>world.spawn(components)</code> because the components of the affected entity must be relocated in memory each time the entity's archetype changes.
  </p>
</aside>

### Destroying entities

Entities are destroyed with `world.destroy`:

```typescript
world.destroy(entity)
```

When an entity is destroyed, its components created with a component type are automatically released back to their object pool.

## World Operations

In the example above, `world.tick()` was called each time entity was modified. Operations such as creating and destroying entities, as well as attaching and detaching components, are deferred until the next `world.tick()` call. This is done to improve the reliability of systems, so that systems never "miss" changes to entities, discussed in the [Filtering](/ecs/filtering) section. Each of these transactions is represented by a `WorldOp`.

You can review the types of operations in [world_op.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/world_op.ts). These objects are used in the Javelin network protocol to synchronize entities reliably between client and server.
