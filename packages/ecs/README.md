# `@javelin/ecs`

![](https://camo.githubusercontent.com/36d0620c487aed9687926c052da8f57bb3361997/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f6c6963656e73652f4d49542f707572706c65)
![](https://camo.githubusercontent.com/e31c52c59d5035f3abb502ef36e4b7b5a10eb173/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f69636f6e2f547970655363726970743f69636f6e3d74797065736372697074266c6162656c)
![](https://flat.badgen.net/bundlephobia/minzip/@javelin/ecs)

A TypeScript Entity-Component System (ECS) for Node and web browsers.

## Docs

Visit https://javelin.games for documentation, examples, and external resources.

## Features

### Fast

Entities are organized by their component makeup into Archetypes for quick lookups and iteration. In a small app (10 component types, 10 archetypes, 10 queries), Javelin can iterate ~2.5 million entities per 16ms on a 2GHz Intel i5 processor.

### Ergonomic

Define your game's data model using plain old JavaScript objects.

```ts
const Transform = {
  x: float64,
  y: float64,
}
const Inventory = {
  bags: arrayOf(arrayOf(uint32)),
}
const world = createWorld()
const entity = world.create(
  component(Transform), // => { x: 0, y: 0 }
  component(Inventory), // => { bags: [] }
)
```

Use third-party objects as components.

```ts
const Mesh = {
  position: {
    x: number,
    y: number,
    z: number,
  },
}
world.create(toComponent(new Three.Mesh(), Mesh))
```

### Intuitive

Query game state using familiar syntax.

```ts
const bodies = createQuery(Transform, Velocity)
const physics = () =>
  bodies((e, [t, v]) => {
    t.x += v.x
    t.y += v.y
  })
```

### Powerful

Best practices are built-in with tools like [Topics](https://javelin.games/ecs/topics) for inter-system messaging.

```ts
const commands = createTopic<PhysicsCommand>()
const movement = () =>
  input((e, [input]) => {
    if (input.jump) {
      commands.push(impulse(e, 0, 10))
    }
  })
const physics = () => {
  for (const command of commands) {
    // ...
  }
}
```

and [Effects](https://javelin.games/ecs/effects) for handling async code, third-party dependencies, and events.

```ts
const render = () => {
  const scene = useScene()
  const model = useLoadGLTF("llama.gltf")

  useMonitor(
    players,
    e => scene.insert(e, model, world.get(e, Transform)),
    e => scene.destroy(e),
  )
}
```
