+++
title = "Change Detection"
weight = 9
+++

Change detection is very difficult to do performantly. Javelin does not currently implement a change detection algorithm that automatically watches component mutations. The only way to fit in potentially hundreds of thousands of tracked changes per tick is to write changes to a cache and decide what to do with them later.

## Tracking Changes

`@javelin/ecs` exports a function named `observe` which provides the means to track changes made to a component. `observe` accepts a component and returns a Proxy instance. This proxy will intercept any mutations made to any of a component's supported data structures, inlcuding structs, objects, arrays, sets, and maps.

```ts
import { component, observe } from "@javelin/ecs"
const position = component(Position)
const positionObserved = observe(position)
```

In the above example, `positionObserved` is a proxy which behaves identically to the original component. When the component is modified, Javelin will store the corresponding operations in an internal cache.

```ts
positionObserved.x = 1
positionObserved.y = 2
```

The only immediate use for `observe` is in conjunction with `@javelin/net` to serialize patches to be sent over the network. At a later time, you will be able to produce your own patches and apply them to other components. This eventual feature provide the means to write code which implicitly keep multiple components in sync.
