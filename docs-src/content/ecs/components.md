+++
title = "Components"
weight = 3
+++

Most data within a game is stored in components. Components are just plain objects; unremarkable, other than one reserved field: `__type__` — short for type id, a unique integer that is shared between all components of the same kind.

The `__type__` field establishes the taxonomy that Javelin uses to store and retrieve components. Take the following example.

```ts
const position = { __type__: 0, x: 2, y: 2 }
const health = { __type__: 0, value: 100 }
```

Using the same `__type__` for components with a different shape could result in catastrophic behavior! Just make the types unique:

```ts
const position = { __type__: 0, ... }
const health = { __type__: 1, ... }
```

Entities can have a single instance of a given type.

## Component Types

A **component type** defines the structure of a component.

```ts
import { number } from "@javelin/ecs"

const Position = {
  x: number,
  y: number,
}
```

Components types can range from simple, with few (or no) properties, to complex with deeply nested structures.

A component type defines the field names and data types that make up the shape of the component. This object is used to initialize component instances and reset them when they are detached from an entity.

The schema currently supports the following data types:

```
number  (default = 0)
string  (default = "")
boolean (default = false)
arrayOf (default = [])
```

A unique id is automatically assigned to each component type the ECS encounters for the first time. If you need to register and assign an id manually (e.g., you are synchronizing your component model in a multiplayer game), you can register the component type manually using `registerComponentType`:

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

Components created using `component()` are automatically pooled. By default, the pool will initialize 10^3 components for use, and will grow by the same amount when the pool shinks to zero. This may not be ideal, especially for singleton or low-volume components. You can modify the default pool size of all component types by setting the `componentPoolSize` option on the config object passed to `createWorld()`:

```ts
const world = createWorld({
  componentPoolSize: 100,
})
```

Or, you can specify the pool size for a single component type when registering the it with `registerComponentType`:

```ts
registerComponentType(Position, 4, 10000)
```

<aside>
  <p>
    <strong>Tip</strong> — the configured or default pool size will be used if a component type is encountered by <code>component()</code> prior to manual registration.
  </p>
</aside>
