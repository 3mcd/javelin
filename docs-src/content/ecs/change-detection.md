+++
title = "Change Detection"
weight = 9
+++

Change detection is often useful, but very difficult to do performantly. Javelin does not currently implement a change detection algorithm that automatically "watches" component mutations. Proxies and setters are slow, and the only way to fit in potentially tens (or hundreds) of thousands of tracked changes per 16ms tick is to manually write changes to a cache.

Fortunately for us, a change cache can be represented as a component! You can attach a component to an entity that stores changes using the built-in `ChangeSet` component type:

```ts
import { ChangeSet } from "@javelin/track"
world.attach(entity, ChangeSet)
```

## Tracking Changes

Retreive an entity's change set just like any other component type: using queries.

```ts
const trackedBodies = createQuery(Position, Velocity, ChangeSet)
const track = () => {
  trackedBodies((e, [p, v, changes]) => {
    // ...
  })
}
```

`@javelin/track` exports functions that correspond to various object mutations, like `set` for property assignment:

```ts
import { track } from "@javelin/track"
trackedBodies((e, [p, v, changes]) => {
  set(p, changes, "x", p.x + v.x)
  set(p, changes, "y", p.y + v.y)
})
```

These functions both perform the specified operation and record the change to the `ChangeSet` component. They also handle paths to deeply nested properties.

```ts
const sword = 55
set(inventory, changes, "bags.0.1", sword)
```

`set` overwrites the previous changes made to the same key. This means they only hold onto the most recent changes made to a component.

```ts
const bow = 56
set(inventory, changes, "bags.0.1", sword)
set(inventory, changes, "bags.0.1", bow)
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

```ts
import { reset } from "@javelin/track"
reset(changes)
```

### Array Mutations

A `ChangeSet` can also track common array mutations, like push and pop:

```ts
import { push, pop } from "@javelin/track"
push(inventory, changes, "bags.0", sword)
pop(inventory, changes, "bags.0")
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

Other functions include `splice`, `shift`, and `unshift` for arrays, `add` and `delete` for sets and maps.
