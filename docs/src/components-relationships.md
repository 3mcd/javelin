# Relationships

Relationships are a special kind of component created by pairing a **relation component** with an entity id.

A relation component is created using the `relation` function.

```ts
let GravitatingTo = j.relation()
```

The value returned by `relation` is a function that builds relationships on a per-entity basis. Relationships can be added to entities like any other component.

```ts
let planet = world.create(Planet)
let spaceship = world.create(j.type(Spaceship, GravitatingTo(planet)))
```

Relationships can be used as query terms to resolve related entities.

```ts
world.of(Planet).each(planet => {
  world.of(GravitatingTo(planet), Velocity).each((entity, velocity) => {
    // (apply gravity)
  })
})
```

Behind the scenes, `relation` creates a hidden tag component that is also attached to any entities with a `GravitatingTo(entity)` relationship component. The relation builder will be subsituted with this hidden tag component when included in a list of query terms.

The following example query finds all entities with relationships of the `GravitatingTo` variety.

```ts
world.of(GravitatingTo).each(entity => {
  // `entity` is affected by gravity
})
```

## Entity Heirarchies

Javelin comes with a special relation component called `ChildOf` that provides the means to create tree-like entity hierarchies.

```ts
let bag = world.create(Bag)
let sword = world.create(j.type(Sword, j.ChildOf(bag)))
```

`ChildOf` can be used with queries to find all children of an entity.

```ts
world.of(j.ChildOf(bag)).each(item => {
  // `item` is a child of `bag`
})
```

Deleting a parent entity will also delete its children.

```ts
world.delete(bag) // also deletes `sword`
```

An entity may have only one parent.

```ts
world.create(type(j.ChildOf(spaceship), j.ChildOf(planet)))
// Error: a type may have only one ChildOf relationship
```

The parent of an entity can be resolved using `world.parentOf`:

```ts
world.parentOf(sword) // `bag`
```
