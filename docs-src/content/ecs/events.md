+++
title = "Events"
weight = 6
+++

You'll eventually need to detect when components are added, removed, or modified. For example, you may want to know when a component is attached to, or detached from, an entity in order to trigger a change in the ECS or notify a third-party library. You can use some of Javelin's built-in effects and methods to react to these kinds of events.

## Monitors

The best way to detect when an entity matches or no longer matches a query is with a **monitor**. `useMonitor` is an effect that accepts a query and executes callbacks when an entity meets or no longer meets the query's criteria.

`useMonitor` accepts `onEnter` and `onExit` callback functions. An entity is only included in a monitor's results **once** while it continues to match the query. An entity is eligible again only if it is excluded (i.e. due to a change in its archetype) and re-included.

```ts
const spooky = createQuery(Enemy, Ghost)
const controlAi = () => {
  useMonitor(
    spooky,
    entity => {}, // entity matches query `spooky`
    entity => {}, // entity no longer matches query `spooky`
  )
}
```

In the above example, the entity passed to the `onEnter` callback is an entity who made one of the following type transitions last step:

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

### Component Changes

The `onEnter` and `onExit` callbacks are also provided query results as well as a diff containing the components whose changes triggered the monitor.

```ts
useMonitor(
  bodies,
  (entity, [position, velocity], diff) => {
    if (diff[0]) {
      /* position was attached */
    }
  },
  (entity, [position, velocity], diff) => {
    if (diff[0]) {
      /* position was detached */
    }
  },
)
```
