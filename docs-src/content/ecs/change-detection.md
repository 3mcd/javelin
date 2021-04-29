+++
title = "Change Detection"
weight = 9
+++

Change detection is often useful, but very difficult to do performantly. Javelin does not currently implement a change detection algorithm that automatically "watches" component mutations. Proxies and setters are slow, and the only way to fit in potentially tens (or hundreds) of thousands of tracked changes per 16ms tick is to manually write changes to a cache.

Fortunately for us, a change cache can be represented as a component! You can attach a component to an entity that stores changes using the built-in `ChangeSet` component type:

```ts
import { ChangeSet } from "@javelin/ecs"
world.attach(entity, ChangeSet)
```

## Tracking Changes

Retreive an entity's change set just like any other component type: using queries!

```ts
const bodies = createQuery(Position, Velocity, ChangeSet)
const sysTrack = () => {
  bodies((e, [position, velocity, changes]) => {})
}
```

You can write changes to the change set using the `track` function:

```ts
import { track } from "@javelin/ecs"

bodies((e, [position, velocity, changes]) => {
  track(changes, position, "x", (position.x += velocity.x))
})
```

<aside>
  <p>
    <strong>Tip</strong> — each call to `track` writes an operation to the cache. However, `track` doesn't actually perform the specified mutation. This means you must mutate your component directly, then write the updated state to the change set component.
  </p>
</aside>

You can easily extract this logic to helper functions to make your systems cleaner:

```ts
const mutBodyMotion = (
  changes: ComponentOf<typeof ChangeSet>,
  position: ComponentOf<typeof Position>,
  velocity: ComponentOf<typeof Velocity>,
) => {
  track(changes, position, "x", (position.x += velocity.x))
  track(changes, position, "y", (position.y += velocity.y))
}
```

### Nested Changes

`track` also handles paths to deeply nested properties.

```ts
const sword = 55
track(changes, inventory, "bags.0.1", sword)
```

`track` will overwrite previous changes made to the same key. In this way, they only hold onto the most recent changes made to a component.

```ts
const bow = 56
track(changes, inventory, "bags.0.1", sword)
track(changes, inventory, "bags.0.1", bow)
```

`ChangeSet` has the following schema:

```ts
const ChangeSetRecord = {
  field: number,
  traverse: arrayOf(string),
}
const ChangeSet = {
  fields: mapOf({
    value: dynamic,
    record: ChangeSetRecord,
  }),
  array: arrayOf({
    path: string,
    method: number,
    record: ChangeSetRecord,
  }),
}
```

In the above example, the entity's `ChangeSet` component would look like:

```ts
{
  object: {
    "bags.0.1": {
      value: 56,
      record: {
        field: 2,
        traverse: ["0", "1"],
      },
    },
  },
  array: [],
}
```

### Resetting Changes

TODO

### Array Mutations

A `ChangeSet` can also track common array mutations, like push, pop, and splice.

```ts
const { trackPush, trackPop, changesOf } = observer
trackPush(changes, inventory, "bags.0", sword)
trackPop(changes, inventory, "bags.0")
```

```ts
{
  array: [
    {
      method: 0,
      value: 55,
      record: {
        path: "bags.0",
        traverse: ["0"],
      },
    },
    {
      method: 1,
      record: {
        path: "bags.0",
        traverse: ["0"],
      },
    },
  ]
}
```

Other functions include `trackShift` and `trackUnshift`.
