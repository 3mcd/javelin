+++
title = "Tagging"
weight = 6
+++

## Tagging Entities

Although most data should live inside of components, sometimes it can be useful associate simple data, e.g. a bitmask, with entities. Entities can be tagged with bit flags via `world.addTag`:

```typescript
enum Tags {
  Awake = 2 ** 0,
}

world.addTag(entity, Tags.Awake)
```

The `world.hasTag` method can be used to check if an entity has a tag. `world.removeTag` removes tags from an entity.

```typescript
const physics = (world: World) => {
  for (const [entity, [body]] of bodies(world)) {
    // Skip sleeping entities
    if (!world.hasTag(entity, Tags.Awake)) {
      // Wake up sleeping entities when something collides with them
      if (body.collisions.length > 0) {
        world.addTag(entity, Tags.Awake)
      } else {
        continue
      }
    }

    // ...
  }
}
```