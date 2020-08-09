+++
title = "Components"
weight = 4
+++

## Components

This section is short, because components are just plain objects; unremarkable, other than two reserved fields:

- `readonly _t` — a unique integer identifying the component's **type**
- `readonly _v` — the current **version** of the component (used for change detection)

The component's type (`_t`) is the only required field when assigning components to an entity, new or otherwise. Newly attached components are assigned a version of `0`. The version property is deleted when the component is detached.

```typescript
const body = { _t: 1, x: 0, y: 0 }
const entity = world.spawn(body)

world.tick()
body._v // -> 0

world.detach(entity, body)
world.tick()
body._v // -> undefined
```

## Component Types

Unless you're trying to integrate with an existing codebase or library, it's recommended to use the `createComponentType` helper to define the component types your world will use. Component types make it easy to initialize components from a schema, and the components they produce are automatically pooled.

```typescript
import { createComponentType, number } from "@javelin/ecs"

const Position = createComponentType({
  type: 1,
  name: "position",
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

A component type is configured with a **type id**, **name**, and **schema**. The type id is an integer used to uniquely identify components produced from the type, while `name` is a unique string used by [`@javelin/devtools`](https://github.com/3mcd/javelin/tree/master/packages/devtool) for help with debugging.

### Schema

The component type's schema defines the field names and data types that make up the shape of the component. Currently, the schema is used to initialize and reset component instances.

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

### Object Pooling

Components created via factory are automatically pooled. By default, the pool will initialize 10^3 components for usage, and will grow by the same amount when the pool shinks to zero. You can modify the pool size either by setting the `componentPoolSize` option on the config object passed to `createWorld()`, or when registering the component type with `world.registerComponentType`:

```typescript
const world = createWorld({
  componentPoolSize: 100,
})
// or
world.registerComponentType(Position, 10000)
```

