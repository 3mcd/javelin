+++
title = "Events"
weight = 6
+++

You may need to detect when components are added, removed, or modified. For example, you may want to know when a component is attached to, or detached from, an entity in order to trigger a change or notify a third-party library. You can use some of Javelin's built-in effects and methods to react to these kinds of events.

## Signals

A world dispatches several events that can be used to react to changes in the ECS.

`world.attached` and `world.detached` are dispatched when components are attached to and deatched from an entity, respectively:

```typescript
world.attached.subscribe((entity, component) => {
  // component was attached last tick
})
world.detached.subscribe((entity, component) => {
  // component was detached last tick
})
```

`world.destroyed` is dispatched when an entity is destroyed:

```typescript
world.destroyed.subscribe(entity => {
  // entity was destroyed last tick
})
```

A function is returned from `signal.subscribe()` that can be used to remove the subscriber.

```typescript
const unsubscribe = world.attached.subscribe(...)
unsubscribe()
```

## Effects

Subscribing to events within systems is tricky since a system is just a function that runs each tick. You could write an effect to ensure a callback is registered only once, or you can use the following built-in effects:

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
  world.attached.subscribe((entity, component) => {
    // filter components by type and push to components array
  })
  return (...) => {
    return components
  }
})
```

<aside>
  <p>
    <strong>Tip</strong> — If you need to react immediately to attached/detached events, consider implementing a custom effect and using the `world.attached` and `world.detached` signals.
  </p>
</aside>


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