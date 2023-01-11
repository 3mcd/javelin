# Enums

Enum-like behavior can be achieved using **slots**. Slots are useful when defining mutually exclusive states, like when implementing character movement systems.

```ts
let MovementState = slot(Running, Walking, Crouching)
```

A slot guarantees that **at most one** of the components included in its defintion may be attached to an entity.

```ts
let character = world.create(type(MovementState(Running)))
world.add(character, type(MovementState(Walking)))
// Error: A type may have at most one component for a given slot
```

You can find entities with a given slot by including the slot in a query's terms.

```ts
world.of(MovementState).each((entity) => {
  // `entity` has a `MovementState`
})
```

Slots are implemented as [relation components](./components-relationships.md), so they follow the same semantics. This also means that a slot produces unique components that are independent of those it was defined with. Below is an example of an type that uses a slot to ensure the entity has at most one element (e.g. water, fire, poison), while also integrating another `Poison` component value for a separate use.

```ts
world.create(type(Element(Poison), Poison))
```