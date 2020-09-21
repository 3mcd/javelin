# `@javelin/ecs`

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
