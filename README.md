<p align="center">
  <img src="./logo.png" width="180px">
</p>

<p align="center">
  <img src="https://github.com/3mcd/javelin/workflows/CD/badge.svg?branch=release/next" alt="CD">
  <a href="https://codecov.io/gh/3mcd/javelin"><img src="https://codecov.io/gh/3mcd/javelin/branch/master/graph/badge.svg?token=8UMA33S9UL" alt="codecov"></a>
</p>

# Javelin

Javelin is a collection of JavaScript packages used to build multiplayer for Node and web browsers. It provides an Entity-Component System (ECS), an efficient protocol used to synchronize game worlds, and a few other helpful utilities.

Javelin is unopinionated and doesn't make many decisions for you. This makes it a good candidate for building many kinds of multiplayer games, but you'll need to bring your own network transport (WebSockets, WebRTC, etc.), matchmaking, database, auth strategy, controller support, etc.

## API Sample

Below is a simple example of a game server that broadcasts entities with both `Position` and `Velocity` components to connected clients.

```ts
import { createWorld, createQuery, component, number } from "@javelin/ecs"
import { createMessageProducer, encode } from "@javelin/net"
import { broadcast } from "./net"
const world = createWorld()
const Position = {
  x: number,
  y: number,
}
const Velocity = {
  x: number,
  y: number,
}
const points = createQuery(Position, Velocity)
const { attach, destroy, update, take } = createMessageProducer()
world.spawn(component(Position), component(Velocity, { x: 0, y: -9.81 }))
world.addSystem(() => useMonitor(points, attach, destroy))
world.addSystem(() =>
  points((e, [p, v]) => {
    p.x += v.x
    p.y += v.y
    update(e, p)
  }),
)
world.addSystem(() => broadcast(encode(take())))
```

## Docs

Visit https://javelin.games

## Packages

| Package                                        | Description                                        |
| ---------------------------------------------- | -------------------------------------------------- |
| [@javelin/core](./packages/core)               | Core types, utilities, and data model              |
| [@javelin/ecs](./packages/ecs)                 | Build games using the ECS pattern                  |
| [@javelin/net](./packages/net)                 | Synchronize ECS worlds                             |
| [@javelin/pack](./packages/pack)               | Convert objects to and from binary arrays          |
| [@javelin/track](./packages/track)             | Record component mutations                         |
| [@javelin/hrtime-loop](./packages/hrtime-loop) | Create smooth, high-precision game loops in NodeJS |

## Examples

| Example                 | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| [spin](./examples/spin) | Entity/component synchronization over WebRTC datachannels |

## Scripts

| Script                    | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `yarn build`              | Build all packages and examples                  |
| `yarn test`               | Run all unit and integration tests               |
| `yarn perf`               | Run all performance tests                        |
| `yarn example:networking` | An example of synchronizing entities over WebRTC |

## Development

```sh
yarn
yarn build
yarn example:networking
```

Note that when developing, changes to code in local, dependent packages will not automatically refresh development apps. Just build the dependent packages and restart the dev server process when you want to test a change.
