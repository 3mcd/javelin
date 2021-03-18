# `@javelin/ecs`

![](https://camo.githubusercontent.com/36d0620c487aed9687926c052da8f57bb3361997/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f6c6963656e73652f4d49542f707572706c65)
![](https://camo.githubusercontent.com/e31c52c59d5035f3abb502ef36e4b7b5a10eb173/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f69636f6e2f547970655363726970743f69636f6e3d74797065736372697074266c6162656c)
![](https://flat.badgen.net/bundlephobia/minzip/@javelin/ecs)

A TypeScript Entity-Component System (ECS) for Node and web browsers.

## Docs

Vistit https://javelin.games for documentation, examples, and external resources.

## Features

### Fast
Entities are organized by their component makeup into Archetypes for quick lookups and iteration.

### Intuitive

Game data is stored in plain old JavaScript objects. Iterate over game state using iteratee methods:

```ts
bodies.forEach((entity, [v, p]) => {
  p.x += v.x
})
```

### Ergonomic

Best practices are built-in with tools like [Topics](https://javelin.games/ecs/topics) for inter-system messaging:

```ts
const sys_movement = () => {
  queries.input.forEach((entity, [input]) => {
    if (input.jump)
      topics.physics.push(impulse(entity, ...))
  })
}
const sys_physics = () => {
  for (const message of topics.physics)
    ...
}
```

and [Effects](https://javelin.games/ecs/effects) for handling async code and third-party dependencies

```ts
const sys_render = () => {
  const scene = effects.scene()
  const model = effects.gltf("llama.gltf")

  queries.players.forEach((entity, [player, position]) => {
    scene.insert(model, position)
  })
}
```

### Small
`@javelin/ecs` is ~10kb minified and ships with tree-shakable ES modules.

