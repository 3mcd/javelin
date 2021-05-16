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

## Monitors

The easiest way to detect when an entity matches or no longer matches a query is with a **monitor**. `useMonitor` is an effect that accepts a query and executes callbacks when an entity meets or no longer meets the query's criteria.

`useMonitor` accepts `onEnter` and `onExit` callback functions. An entity is only included in a monitor's results **once** while it continues to match the query. An entity is eligible again only if it is excluded (i.e. due to a change in its type) and re-included.

```ts
const spooky = createQuery(Enemy, Ghost)
const controlAi = () => {
  useMonitor(
    spooky,
    e => {}, // entity matches query `spooky`
    e => {}, // entity no longer matches query `spooky`
  )
}
```

In the above example, the entity passed to the `onEnter` callback is an entity who made one of the following type transitions last tick:

```
from    | to
--------|----------------
()      | (Enemy, Ghost)
(Enemy) | (Enemy, Ghost)
(Ghost) | (Enemy, Ghost)
```

Below is an example of an entity transitioning between multiple archetypes, and whether or not that transition would result in the entity being passed to the `onEnter` callback:

```
(Enemy)                  -> excluded
(Enemy, Ghost)           -> included
(Enemy, Ghost, Confused) -> excluded
(Ghost, Confused)        -> excluded
(Enemy, Ghost)           -> included
```

Monitors can also be used to detect when a single component is added or removed from an entity by using a query with a single component type.

```ts
const bodies = createQuery(Body)
const simulate = () => {
  useMonitor(
    bodies,
    e => {}, // Body component attached to entity
    e => {}, // Body component detached from entity
  )
}
```
