+++
title = "Change Detection"
weight = 9
+++

Javelin implements a very basic change detection algorithm using [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) that can observe deeply nested changes made to components.

Change detection is very useful, but difficult to do performantly; therefore, **components are not observed by default** to achieve good baseline performance.

## Techniques

The `world.getObservedComponent` method returns a copy of a component that will notify the world when its data changes. It's important to remember to use this method when you want to use one of the change detection techniques outlined below. Bugs can arise in your game when you expect a component to be observed but you forgot to manipulate an observed copy.

### Filtering

Sometimes you don't need to know exactly which properties on a component changed, only that it _was_ changed. In this case, you can use either the `changed` component filter in a query, or use the `world.isComponentChanged` method, which returns `true` if the component was changed last tick, and `false` if it wasn't.

Using the `changed` filter:

```typescript
const queries = {
  changed: query(changed(Health))
}

for (const [entity, health] of queries.changed) {
  // `entity` is an entity who's health component changed last tick
}
```

Using `world.isComponentChanged`:

```typescript
for (const [entity, health] of healthy(world)) {
  if (world.isComponentChanged(health)) {
    // `health` changed last tick
  }
}
```

### Observing

If you want to know exactly what changes were made to a component during the current tick, use `world.getComponentMutations`. This method returns a 1-dimensional array of changes made to a component. Take the following example:

```typescript
for (const [entity, position, input] of queries.vehicles) {
  const observedPosition = world.getObservedComponent(position)

  observedPosition.x = 2
  observedPosition.y = 3
  observedPosition.extra.asleep = true

  world.getComponentMutations(position) // -> ["x", 2, "y", 3, "extra.asleep", true]
}
```

## Networking

`@javelin/net` uses this change detection algorithm to optimize packet size by only including the component data that changed during the previous tick in network messages. This means that changes made to unobserved components will not be sent to clients.
