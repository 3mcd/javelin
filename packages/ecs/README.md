# `@javelin/ecs`

A simple, fast ECS for TypeScript.

## Entity

An entity is an integer id.

```ts
const entity = 1
```

## Storage

Components are associated with entities within a data structure called `Storage`.

```ts
import { Storage } from "@javelin/ecs"

const storage = new Storage()
```

The `storage.insert()` method associates one or more components with an entity.

```ts
storage.insert(1, [
  { _t: 1, x: 0, y: 0 }, // Position
  { _t: 2, x: 0, y: 0 }, // Velocity
])
```

Where `_t` is an entity type, which is a unique integer identifying the component type.

Components can be built using factories that create pooled instances of components.

```ts
import { createComponentFactory, number } from "@javelin/ecs"

const Position = createComponentFactory({
  type: 1,
  schema: {
    x: number,
    y: number,
  },
})

const p = Position.create()

storage.insert(1, [p])
```

Storages can be queried via the `Query` class.

```ts
import { Query } from "@javelin/ecs"

const moving = new Query([Position, Velocity])

for (const [p, v] of moving.run(storage)) {
  p.x += v.x
  p.y += v.y
}
```

Entities can be filtered via the `.filter()` method.

```ts
enum Tags {
  Awake = 1,
}

storage.addTag(1, Tags.Awake)

for (const [p, v] of moving.filter(Tags.Awake).run(storage)) {
  // p and v components belong to an entity tagged as Awake
}
```

Components are versioned. Versions of a component can be incremented using the `storage.incrementVersion()` method:

```ts
storage.incrementVersion(v)
```

You can use a built-in filter to take advantage of versioning for change-detection:

```ts
import { changed } from "@javelin/ecs"

const query = new Query([Position, Velocity]).filter(changed())

console.assert(Array.from(query.run(storage)).length === 1)
console.assert(Array.from(query.run(storage)).length === 0)
```
