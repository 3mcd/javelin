+++
title = "Tagging"
weight = 6
+++

Entities can be tagged with bit flags via `world.addTag`:

```typescript
enum Tags {
  Awake = 2 ** 0,
  Dying = 2 ** 1,
}

world.addTag(entity, Tags.Awake | Tags.Dying)
```

The `world.hasTag` method can be used to check if an entity has a tag. `world.removeTag` removes tags from an entity.

```typescript
world.hasTag(entity, Tags.Awake) // -> true
world.hasTag(entity, Tags.Dying) // -> true
world.removeTag(entity, Tags.Awake)
world.hasTag(entity, Tags.Awake) // -> false
```

`tag` produces a filter that will exclude entities which don't have the provided tag(s):

```typescript
enum Tags {
  Nasty = 2 ** 0,
  Goopy = 2 ** 1,
}

const nastyAndGoopy = query(select(Player), tag(Tags.Nasty | Tags.Goopy))

for (const [player] of nastyAndGoopy(world)) {
  // `player` belongs to an entity with Nasty and Goopy tags
}
```
