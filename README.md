<p align="center">
  <img src="./logo.png" width="180px">
</p>

<p align="center">
  <img src="https://github.com/3mcd/javelin/workflows/CD/badge.svg?branch=release/next" alt="CD">
  <a href="https://codecov.io/gh/3mcd/javelin"><img src="https://codecov.io/gh/3mcd/javelin/branch/master/graph/badge.svg?token=8UMA33S9UL" alt="codecov"></a>
</p>

# Javelin

Javelin is a collection of JavaScript packages that provide the means to create multiplayer games for Node and web browsers. It's comprised of an Entity-Component System (ECS), an efficient networking protocol, and other helpful utilities like a high-precision game loop for Node.

Javelin doesn't make many decisions for you. Its lack of opinions makes Javelin a good candidate for building many kinds of multiplayer games, but you'll need to bring your own network transport (WebSockets, WebRTC, etc.), database, auth strategy, controller support, matchmaking, etc.

## API Sample

Below is an example game server that broadcasts entities with both `Position` and `Velocity` components to connected clients.

```ts
import { createWorld, createQuery, component, useMonitor } from "@javelin/ecs"
import { createMessageProducer, encode, float64 } from "@javelin/net"
import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { broadcast } from "./net"

const Position = {
  x: float64,
  y: float64,
}
const Velocity = {
  x: float64,
  y: float64,
}
const world = createWorld()
const points = createQuery(Position, Velocity)
const messages = createMessageProducer()

// create an entity
world.create(component(Position), component(Velocity, { x: 0, y: -9.81 }))
// create/delete points on client
world.addSystem(() => useMonitor(points, messages.attach, messages.destroy))
// update point positions
world.addSystem(() =>
  points((e, [p, v]) => {
    p.x += v.x
    p.y += v.y
    messages.update(e, p)
  }),
)
// broadcast messages to clients
world.addSystem(() => broadcast(encode(messages.take())))
// start a high-precision game loop
createHrtimeLoop((1 / 60) * 1000, world.step).start()
```

There's a lot more that goes into building a game, but hopefully this example demonstrates the unobtrusive and consise nature of Javelin's API.

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
