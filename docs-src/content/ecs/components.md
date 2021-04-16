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

## Component Types

The `createComponentType` helper is used to define the types of components in your game. Component types make it easy to initialize components from a schema, and components created with a component type are automatically pooled.

```ts
import { createComponentType, number } from "@javelin/ecs"

const Position = createComponentType({
  type: 1,
  schema: {
    x: number,
    y: number,
  },
})
```

A component type has, at minimum, a type and **schema**, which is discussed below.

### Schema

A component type's schema defines the field names and data types that make up the shape of the component. The schema is used to initialize component instances and reset them when they are detached from an entity.

The schema currently supports the following data types:

```
number  (default = 0)
boolean (default = false)
string  (default = "")
array   (default = [])
```

A default value for a data type can be specified in the schema by wrapping the data type in an object:

```ts
schema: {
  x: { type: number, defaultValue: -1 }
}
```

### Creating Components

A component is initialized from a component type using `world.component`:

```ts
const position = world.component(Position)

position.x // 0
position.y // 0
```

You may also specify an initializer function for a component type to make component creation easier.

```ts
const Position = createComponentType({
  ...
  initialize(position, x = 0, y = 0) {
    position.x = x
    position.y = y
  },
})

const position = world.component(
  Position,
  10, // x
  20, // y
)
```

### Object Pooling

Components created via a component type are automatically pooled. By default, the pool will initialize 10^3 components for use, and will grow by the same amount when the pool shinks to zero. This may not be ideal, especially for singleton or low-volume components. You can modify the default pool size of all component types by setting the `componentPoolSize` option on the config object passed to `createWorld()`:

```ts
const world = createWorld({
  componentPoolSize: 100,
})
```

Or, you can specify the pool size for a single component type when registering the it with `world.registerComponentType`:

```ts
world.registerComponentType(Position, 10000)
```

<aside>
  <p>
    <strong>Tip</strong> — the configured or default pool size will be used if a component type is encountered by <code>world.component()</code> prior to manual registration.
  </p>
</aside>
