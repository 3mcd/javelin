# @javelin/ecs

Javelin is an implementation of [ECS](https://github.com/SanderMertens/ecs-faq), a popular architecture for building games with dynamic entity behavior.

Join us on [Discord](https://discord.gg/AbEWH3taWU)!

## Docs

Visit https://javelin.dev

## Installation

```sh
npm i @javelin/ecs
```

## Quick Start

```ts
import * as j from "@javelin/ecs"
// define entity data
let Pos = j.value({x: "number", y: "number"})
let Vel = j.value({x: "number", y: "number"})
// create an app
let app = j
  .app()
  // initialize entities (discrete game units)
  .addInitSystem(world => {
    let origin = {x: 0, y: 0}
    world.create(j.type(Pos, Vel), origin, {x: 0, y: -1})
  })
  // find entities by type
  .addSystem(world => {
    world.query(j.type(Pos, Vel)).each((entity, pos, vel) => {
      pos.x += vel.x
      pos.y += vel.y
    })
  })
  // call all registered systems
  .step()
```
