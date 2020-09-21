# `@javelin/ecs`

![](https://camo.githubusercontent.com/36d0620c487aed9687926c052da8f57bb3361997/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f6c6963656e73652f4d49542f707572706c65)
![](https://camo.githubusercontent.com/e31c52c59d5035f3abb502ef36e4b7b5a10eb173/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f69636f6e2f547970655363726970743f69636f6e3d74797065736372697074266c6162656c)
![](https://flat.badgen.net/bundlephobia/minzip/@javelin/ecs)

A TypeScript Entity-Component System (ECS) for Node and web browsers.

## Primer

ECS is a pattern commonly used in game development to associate **components** (state) with stateless **entities** (game objects). **Systems** then operate on collections of entities of shared composition.

For example, a system could add a `Burn` component to entities with `Position` and `Health` components when their position intersects with a lava pit.

## Docs

Visit https://javelin.games

## Features

- **Small**
  - ~8kb minified
- **Performant**
  - Entities are organized by component makeup into Archetypes for fast iteration
  - Entities can be tagged with bit flags for quick filtering
- **Ergonomic**
  - Minimal API
  - No classes or inheritance
- **Unopinionated**
  - Leaves many opinions up to you, meaning it can be integrated with other packages or pre-existing projects
