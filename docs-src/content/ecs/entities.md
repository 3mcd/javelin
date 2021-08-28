+++
title = "Entities"
weight = 4
+++

An **entity** is a pointer to a unique collection of components that represent higher-order objects in your game. Entities are strictly defined by their component makeup, and do not contain any data or methods of their own.

## Entity Management

A world has several methods for managing entities.

### Creating Entities

Entities are created using `world.create`. This method accepts zero or more components and returns the newly created entity.

```ts
const player = component(Player)
const health = component(Health)
const entity = world.create(player, health)
```

Entities can have a single instance of a given component type.

<aside>
  <p>
    <strong>Tip</strong> — although entities are simply auto-incrementing integers (starting at <code>0</code>), they should be treated as opaque values.
  </p>
</aside>

### Modifying Entities

The array of components associated with an entity defines its **archetype**. The above example would create an entity of archetype `(Player, Health)`.

Components can be assigned to existing entities using `world.attach`, and removed from entities using `world.detach`. The following example modifies an entity of archetype `(Player, Health)` to `(Player, Health, Input)`, and then back to `(Player, Health)`:

```ts
const input = component(Input)

world.attach(entity, input)
world.step() // (Player, Health) -> (Player, Health, Input)

world.detach(entity, input)
world.step() // (Player, Health, Input) -> (Player, Health)
```

<aside>
  <p>
    <strong>Tip</strong> — using <code>world.attach</code> and <code>world.detach</code> to build entities is slower than <code>world.create(...components)</code> because the components of the affected entity must be relocated each time the entity's archetype changes.
  </p>
</aside>

### Destroying Entities

Entities are destroyed with `world.destroy`:

```ts
world.destroy(entity)
```

When an entity is destroyed, its components are automatically released back to their object pool if they were derived from a component type.

### Component Lookup

Entity data is traditionally accessed using iterable [queries](/ecs/systems/#querying-and-iteration). The capabilities of queries are limited, and occasionally you will need to write conditional logic based on an entity's component makeup.

`world.tryGet` attempts to locate a component of an entity by component type, returning `null` if not found:

```ts
if (world.tryGet(entity, Invulnerable) === null) {
  health.value -= burn.valuePerTick
}
```

`world.get` will throw an error if the component is not found:

```ts
world.get(entity, Position) // Failed to get component: entity does not have component
```

## World Operations

In the example above, `world.step()` was called each time entity was modified. By default, operations like attaching and detaching components, are deferred until the next `world.step()` call. This is done to improve the predictability of systems, so that systems never miss changes to entities, discussed in the [Events](/ecs/events) section.

### Immediate Operations

Each ECS operation has an **immediate** variant. For example, `attach` has an `attachImmediate` variant which attaches one or more components during the current tick:

```ts
world.attachImmediate(entity, [component(Position)])
world.tryGet(entity, Position) // { x: 0, y: 0 }
```
