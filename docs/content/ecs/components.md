+++
title = "Components"
weight = 4
+++

## Components

Components are plain objects; unremarkable, other than a few reserved fields:

- `_t` is a unique integer identifying the component's **type**
- `_e` records the **entity** the component is associated with
- `_v` records the current **version** of the component, and used for change detection

The component's type, or `_t`, is the only required field when assigning components to an entity (new or otherwise).

```typescript
world.create([
  { _t: 1, x: 0, y: 0 },
  { _t: 2, health: 10 },
]);
```

A component with type `1` belonging to entity `5` that has been modified three times might look like:

```typescript
{
  _t: 1,
  _e: 5,
  _v: 3,
  // ...
}
```

## Component Factories

It's strongly recommended to use the `createComponentFactory` helper to create factories to build your components.

```typescript
import { createComponentFactory, number } from "@javelin/ecs";

const Position = createComponentFactory({
  type: 1,
  name: "position",
  schema: {
    x: number,
    y: number,
  },
});
```

A component factory is configured with a type, name, and schema. `type` is be a unique integer and `name` is a unique string. The component factory's name is used by [`javelin/devtools`](https://github.com/3mcd/javelin/tree/master/packages/devtool) for help with rendering.

The `schema` option defines the field names and data types that make up the shape of the component. Currently, the schema is used to automatically initialize and reset component instances. In the future, it may be used to improve compression of components when serialized.

Components created via factory are automatically pooled; however, you must register the factory with the world so components are released back to the pool when their entity is destroyed:

```typescript
const world = createWorld({ componentFactories: [Position] });
// OR
world.registerComponentFactory(Position);
```

Otherwise, you'll need to release pooled components manually with the `componentFactory.destroy` method.
