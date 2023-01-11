# Queries

An entity is defined by the components associated with it. Components grant the data (component values) to entities that are needed to model a specific behavior. This leaves systems with the implementation of that behavior.

In order for a system to implement entity behavior, it must first find all entities of interest. This is done using queries.

A system may query entities using it's world's `of` method.

```ts
let Planet = type(PlanetGeometry, PlanetType, ...)

function orbit_planets_system(world: World) {
  let planets = world.of(Planet)
}
```

Entities that match the query's terms are iterated using the query's `each` method.

```ts
planets.each(planet => {
  // `planet` has all components defined in the `Planet` type
})
```

Query terms may include types, components (including [relation tags](http://localhost:3000/components-relationships.html), [relationships](http://localhost:3000/components-relationships.html), [slot tags](http://localhost:3000/components-enums.html), and [slot members](http://localhost:3000/components-enums.html)), and filters, discussed later in the chapter.

## Query Views

Systems are often highly specific about the entities they resolve while only utilizing a small subset of the entities' component values. The component values a query iteratee recieves can be narrowed using the query's `as` method.

```ts
world
  .of(ElectrifiedHipposStandingInWater)
  .as(Health)
  .each((hippo, hippo_health) => {
    // (do something with just the hippo's health)
  })
```

## Query Filters

The results of a query can be further narrowed using query filters. Javelin currently has two query filters: `Not` and `Changed`.

### Not

The `Not` filter excludes entities that match a given component.

```ts
world.of(Planet, Not(Atmosphere)).each(planet => {
  // `planet` does not have an atmosphere component
})
```

`Without` can be used with more complex component types like [relationships](./components-relationships.md) and [slots](./components-enums.md). The following query could be expressed in plain terms as _"all gas planets that are not in the Sol system"_:

```ts
world.of(Planet, PlanetType(Gas), Not(ChildOf(sol_system)))
```

Another example: _"all non-gas planets"_:

```ts
world.of(Planet, Not(PlanetType(Gas)))
```

### Changed

> The `Changed` filter is under development.
