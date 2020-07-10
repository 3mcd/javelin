# `@javelin/ecs`

A TypeScript Entity-Component System (ECS) for Node and web browsers.

## Docs

https://3mcd.github.io/javelin

## Primer

ECS is a pattern commonly used in game development to associate **components** (state) with stateless **entities** (game objects). **Systems** then operate on collections of entities of shared composition.

For example, a system could add a `Burn` component to entities with `Position` and `Health` components when their position intersects with a lava pit.

## Features

- **Performant**
  - Entities are organized by component makeup into Archetypes for fast iteration
  - Entities can be tagged with bit flags for quick filtering
- **Ergonomic**
  - Minimal API
  - No classes or inheritance
- **Unopinionated**
  - Leaves many opinions up to you, meaning it can be integrated with other packages or pre-existing projects

## Performance

Run `yarn perf` to run performance tests.

Example perf on 2018 MacBook Pro where 350k entities are iterated per tick at 60 FPS:

```
========================================
perf_storage
========================================
create: 129.333ms
run: 14684.131ms
destroy: 19.823ms
entities      | 300000
components    | 4
queries       | 4
ticks         | 1000
iter          | 350350000
iter_tick     | 350350
avg_tick      | 14.982ms
========================================
perf_storage_pooled
========================================
create: 133.237ms
run: 16789.444ms
destroy: 25.286ms
entities      | 300000
components    | 4
queries       | 4
ticks         | 1000
iter          | 350350000
iter_tick     | 350350
avg_tick      | 16.789ms
```
