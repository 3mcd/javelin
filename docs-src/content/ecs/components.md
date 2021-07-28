+++
title = "Components"
weight = 3
+++

Most data within a game is stored in components. Components are just plain objects!

## Schemas

A **schema** is an object that defines the structure of a component.

```ts
import { number } from "@javelin/ecs"

const Position = {
  x: number,
  y: number,
}
```

Schema may range from flat structures with few (or no) properties, to complex objects containing deeply nested structures.

```ts
const Inventory = {
  bags: arrayOf({ items: arrayOf(number) }),
}
```

A schema is used to initialize component instances and reset them when they are detached from an entity.

The schema currently supports the following data types:

```
number  (default = 0)
string  (default = "")
boolean (default = false)
arrayOf (default = [])
```

When Javelin encounters a schema for the first time, it will automatically assign it a unique integer id. If you need to assign a specific id to a schema (e.g., you're synchronizing your component model in a multiplayer game), you can register the schema manually using `registerSchema`:

```ts
import { registerSchema } from "@javelin/ecs"

registerSchema(Position, 4)
```

### Creating Components

Components are created using the `component()` function.

```ts
import { component } from "@javelin/ecs"

const position = component(Position)
```

Components created using `component()` are automatically pooled. By default, the pool will initialize 10^3 components for use, and will grow by the same amount when the pool shinks to zero. This may not be ideal for singleton or low-volume components. You may specify the pool size for a single schema when registering the it with `registerSchema`:

```ts
registerSchema(Position, 4, 10000)
```

<aside>
  <p>
    <strong>Tip</strong> — the configured or default pool size will be used if a schema is encountered by <code>component()</code> prior to manual registration.
  </p>
</aside>

### External Objects

You can use any object as a component. You should register the component like so:

```ts
const Mesh = registerComponent<Three.Mesh>({
  position: {
    x: number,
    y: number,
    z: number,
  },
})
```

You can instruct Javelin to treat a third-pary library object as a component using the `toComponent` method. Simply call `toComponent` with the object and the component schema you want to classify it with:

```ts
world.attach(entity, toComponent(new Three.Mesh(), Mesh))
```

`toComponent` does not create a new object, so referential integrity is maintained. There are no restrictions on the types of objects that can be used as components: they can even be sealed or frozen! External components are not pooled.
