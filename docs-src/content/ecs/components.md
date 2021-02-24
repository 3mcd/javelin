+++
title = "Components"
weight = 3
+++

All data within a `World` is stored in components. Components are just plain objects; unremarkable, other than one reserved field: `_tid` — short for type id, a unique integer that is shared between all components of the same kind.

The `_tid` field establishes the taxonomy that Javelin uses to store and retrieve components. Take the following example.

```typescript
const position = { _tid: 0, x: 2, y: 2 }
const health = { _tid: 0, value: 100 }
```

Using the same `_tid` for components with a different shape could result in catastrophic behavior of your application. Wherever you might be working with an entity's position component, there's a chance you could have a health object instead!

Just make the types unique:

```typescript
const position = { _tid: 0, ... }
const health = { _tid: 1, ... }
```

## Component Types

It's recommended to use the `createComponentType` helper to define the component types your world will use. Component types make it easy to initialize components from a schema, and components created with a component type are automatically pooled.

```typescript
import { createComponentType, number } from "@javelin/ecs"

const Position = createComponentType({
  type: 1,
  schema: {
    x: number,
    y: number,
  },
})
```

A component type has, at minimum, a type (discussed above) and **schema**.

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

```typescript
schema: {
  x: { type: number, defaultValue: -1 }
}
```

### Creating components

Components can be initialized from component types via `world.component`:

```typescript
const position = world.component(Position)

position.x (0)
position.y (0)
```

You may also specify an initializer function for a component type to make component creation easier.

```typescript
const Position = createComponentType({
  ...
  initialize(position, x = 0, y = 0) {
    position.x = x
    position.y = y
  },
})

const position = world.component(
  Position,
  10, (x)
  20, (y)
)
```

### Object Pooling

Components created via a component type are automatically pooled. By default, the pool will initialize 10^3 components for usage, and will grow by the same amount when the pool shinks to zero. This may not be ideal, especially for singletons or components that are created/destroyed extremely often. You can modify the default pool size of all component types by setting the `componentPoolSize` option on the config object passed to `createWorld()`

```typescript
const world = createWorld({
  componentPoolSize: 100,
})
```

or you can specify the pool size for a single component type when registering the it with `world.registerComponentType`

```typescript
world.registerComponentType(Position, 10000)
```

<aside>
  <p>
    <strong>Note</strong> — the configured or default pool size will be used if a component type is encountered by <code>world.component()</code> prior to manual registration.
  </p>
</aside>