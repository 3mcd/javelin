+++
title = "Components"
weight = 3
+++

Most data within a game is stored in components. Components are just plain objects; unremarkable, other than one reserved field: `__type__`, a unique integer that is shared between all components of the same kind.

The `__type__` field establishes the taxonomy that Javelin uses to store and retrieve components. Take the following example:

```ts
const position = { __type__: 0, x: 2, y: 2 }
const health = { __type__: 0, value: 100 }
```

Although the two objects represent different state, Javelin won't be able to tell the difference between the two because they share the same identifier. Using the same `__type__` for components with a different shape could result in catastrophic behavior in your game! Just make the types unique:

```ts
const position = { __type__: 0, ... }
const health = { __type__: 1, ... }
```

## Component Types

A **component type** is an object that defines the structure of a component.

```ts
import { number } from "@javelin/ecs"

const Position = {
  x: number,
  y: number,
}
```

Components types may range from flat structures with few (or no) properties, to complex objects containing deeply nested structures.

```ts
const Inventory = {
  bags: arrayOf({ items: arrayOf(number) }),
}
```

A component type is used to initialize component instances and reset them when they are detached from an entity.

The schema currently supports the following data types:

```
number  (default = 0)
string  (default = "")
boolean (default = false)
arrayOf (default = [])
```

When Javelin encounters a component type for the first time, it will automatically assign it a unique integer id. If you need to assign a specific id to a component type (e.g., you are synchronizing your component model in a multiplayer game), you can register the component type manually using `registerComponentType`:

```ts
import { registerComponentType } from "@javelin/ecs"

registerComponentType(Position, 4)
```

### Creating Components

Components are created using the `component()` function.

```ts
import { component } from "@javelin/ecs"

const position = component(Position)
```

Components created using `component()` are automatically pooled. By default, the pool will initialize 10^3 components for use, and will grow by the same amount when the pool shinks to zero. This may not be ideal for singleton or low-volume components. You may specify the pool size for a single component type when registering the it with `registerComponentType`:

```ts
registerComponentType(Position, 4, 10000)
```

<aside>
  <p>
    <strong>Tip</strong> — the configured or default pool size will be used if a component type is encountered by <code>component()</code> prior to manual registration.
  </p>
</aside>
