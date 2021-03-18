+++
title = "Filtering"
weight = 5
+++

It's often react when components are added, removed, or modified. For example, you may want to know when a component is attached to, or detached from, an entity in order to notify a third-party library. You can use some of Javelin's built-in effects and methods to react to these kinds of events.

### Attached

The `attached` effect returns an array of components which were attached during the previous tick.

```typescript
import { attached } from "@javelin/ecs"

const sys_physics = () => {
  attached(Body).forEach(body => {
    ...
  })
}
```

`attached`'s implementation looks something like:

```typescript
const attached = createEffect(world => {
  const components = []
  world.attached.subscribe(component => {
    // filter components by type and push to components array
  })
  return (...) => {
    return components
  }
})
```

If you want to react immediately to attached/detached events, consider implementing a custom effect and using the `world.attached` and `world.detached` signals.

### Detached

The `detached` effect returns an array of components which were attached during the previous tick.

```typescript
import { detached } from "@javelin/ecs"

const sys_physics = (world: World) => {
  detached(Body).forEach(body => {
    ...
  })
}
```

### Changed

A world tracks changes made to all its components. The `isComponentChanged` method accepts a component and will return true if the component was changed last tick, otherwise it returns false.

```typescript
if (world.isComponentChanged(body)) {
  simulation.sync(body)
}
```