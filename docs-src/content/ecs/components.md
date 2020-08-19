+++
title = "Components"
weight = 4
+++

## Components

All data within the ECS is stored in components. Components are just plain objects; unremarkable, other than two reserved fields:

- `_t` — a unique integer identifying the component's **type**
- `_v` — the current **version** of the component (used for change detection)

The component's type (`_t`) is the only required field when assigning components to an entity, new or otherwise. Newly attached components are assigned a version of `0`.

## Component Types

Unless you're trying to integrate with an existing codebase or library, it's recommended to use the `createComponentType` helper to define the component types your world will use. Component types make it easy to initialize components from a schema, and the components they produce are automatically pooled.

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

The component type **must** be registered using `world.registerComponentType` to take advantage of pooling:

```typescript
const world = createWorld({
  componentTypes: [Position],
})
// OR
world.registerComponentType(Position)
```

A component type has, at minimum, a **type id** and **schema**. The type id is an integer used to uniquely identify components produced from the type. We'll talk about the component type's schema below.

### Schema

The component type's schema defines the field names and data types that make up the shape of the component. The schema is used to initialize component instances and reset them when they are detached.

The schema currently supports the following data types, which are each exported from `@javelin/ecs`:

- `number (0)`
- `boolean (false)`
- `string ("")`
- `array(number | boolean | string | array) ([])`

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

position.x // 0
position.y // 0
```

You may also specify an initializer function for a component type to make component creation easier.

```typescript
const Position = createComponentType({
  // ...
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

position.x // 10
position.y // 20
```

### Object Pooling

Components created via factory are automatically pooled. By default, the pool will initialize 10^3 components for usage, and will grow by the same amount when the pool shinks to zero. You can modify the pool size either by setting the `componentPoolSize` option on the config object passed to `createWorld()`, or when registering the component type with `world.registerComponentType`:

```typescript
const world = createWorld({
  componentPoolSize: 100,
})
// or
world.registerComponentType(Position, 10000)
```
