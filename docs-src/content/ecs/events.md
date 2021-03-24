+++
title = "Events"
weight = 6
+++

You'll eventually need to detect when components are added, removed, or modified. For example, you may want to know when a component is attached to, or detached from, an entity in order to trigger a change in the ECS or notify a third-party library. You can use some of Javelin's built-in effects and methods to react to these kinds of events.

## Signals

A world dispatches several events, called [signals](https://millermedeiros.github.io/js-signals/), that can be used to react to changes in the ECS.

The `world.attached` and `world.detached` signals are dispatched when components are attached to and deatched from an entity, respectively:

```ts
world.attached.subscribe((entity, component) => {
  // component was attached last tick
})
world.detached.subscribe((entity, component) => {
  // component was detached last tick
})
```

`world.spawned` is dispatched when an entity is created:

```ts
world.spawned.subscribe(entity => {
  // entity was created last tick
})
```

`world.destroyed` is dispatched when an entity is destroyed:

```ts
world.destroyed.subscribe(entity => {
  // entity was destroyed last tick
})
```



A function is returned from `signal.subscribe()` that can be used to remove the subscriber.

```ts
const unsubscribe = world.attached.subscribe(...)
unsubscribe()
```

## Triggers

Subscribing to events within systems is tricky since a system is just a function that runs each tick. Javelin has a couple of built-in effects called **triggers** that register event handlers behind the scenes, exposing changed entitites with an iterable API.

### `onAttach`

The `onAttach` trigger accepts a component type and returns an object that can be iterated with `for..of` or `forEach` to get entity-component pairs where the component of the specified type was detached last tick.

```ts
import { onAttach } from "@javelin/ecs"

const sys_physics = () => {
  onAttach(Body).forEach((entity, body) => {
    ...
  })
}
```

### `onDetach`

`onDetach` is similar to `onAttach`, but it returns entity-component pairs whose matching component was detached last tick.

```ts
import { onDetach } from "@javelin/ecs"

const sys_physics = (world: World) => {
  onDetach(Body).forEach((entity, body) => ...)
}
```

## Monitors

Sometimes you need to go a bit further and detect when an entity matches or no longer matches a complex query. A **monitor** is an effect that accepts a query and yields entities that meet one of these conditions. Like triggers, monitors can be iterated with `forEach` or `for..of`.

An entity is only included in a monitor's results **once** while it continues to match the query. An entity is eligible again only if it is excluded (i.e. due to a change in its type) and re-included.

### `onInsert`

The `onInsert` monitor yields entities who will match a specific query for the first time this tick.

```ts
const spooky = query(Enemy, Ghost)
onInsert(spooky).forEach(entity => ...)
```

`forEach` executes the provided callback for entities whose component changes last tick caused it to match the query's criteria. In the above example, the `entity` variable would correspond to an entity who made one of the following type transitions last tick:

```
from    | to
--------|----------------
()      | (Enemy, Ghost)
(Enemy) | (Enemy, Ghost)
(Ghost) | (Enemy, Ghost)
```

 Below is an example of an entity transitioning between multiple types, and whether or not that transition would result in the entity being included in `onInsert`'s results:

```
(Enemy)                  -> excluded
(Enemy, Ghost)           -> included
(Enemy, Ghost, Confused) -> excluded
(Ghost, Confused)        -> excluded
(Enemy, Ghost)           -> included
```

### `onRemove`

`onRemove` is simply the inverse of `onInsert`. It will yield entities whose type no longer matches the query's criteria.

```ts
onRemove(spooky).forEach(entity => ...)
```

```
(Enemy)                  -> excluded
(Enemy, Ghost)           -> excluded
(Enemy, Ghost, Confused) -> excluded
(Ghost, Confused)        -> included
(Enemy, Ghost)           -> excluded
```

## Changes

A world tracks changes made to all its components. The `isComponentChanged` method accepts a component and will return true if the component was changed last tick, otherwise it returns false.

```ts
if (world.isComponentChanged(body)) {
  simulation.sync(body)
}
```