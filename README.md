<p align="center">
  <img src="./logo.png" width="180px">
</p>

<p align="center">
  <img src="https://github.com/3mcd/javelin/workflows/CD/badge.svg?branch=release/next" alt="CD">
  <a href="https://codecov.io/gh/3mcd/javelin"><img src="https://codecov.io/gh/3mcd/javelin/branch/master/graph/badge.svg?token=8UMA33S9UL" alt="codecov"></a>
  <a href="https://discord.gg/AbEWH3taWU"><img src="https://img.shields.io/discord/844566064281026600?logo=discord" alt="discord"></a>
  <img src="https://img.shields.io/lgtm/grade/javascript/github/3mcd/javelin">
</p>

# Javelin

Join us on [Discord](https://discord.gg/AbEWH3taWU)!

Javelin is a collection of JavaScript packages that provide the means to create multiplayer games for Node and web browsers. It's comprised of an Entity-Component System (ECS), an efficient networking protocol, and other helpful utilities like a high-precision game loop for Node.

Javelin's lack of opinions makes it a good candidate for building many kinds of multiplayer games, but you'll need to bring your own network transport (WebSockets, WebRTC, etc.), database, auth strategy, controller support, matchmaking, etc.

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
  }),
)
// broadcast messages to clients
world.addSystem(() => {
  if (useInterval((1 / 20) * 1000)) {
    points(messages.update)
    broadcast(encode(messages.take()))
  }
})
// start a high-precision game loop
createHrtimeLoop(world.step, (1 / 60) * 1000).start()
```

There's a lot more that goes into building a game, but hopefully this example demonstrates the unobtrusive and consise nature of Javelin's APIs.

## Docs

Visit https://javelin.games

## Packages

| Name                                                     | Description                                            |
| -------------------------------------------------------- | ------------------------------------------------------ |
| [@javelin/core](./packages/core)                         | Core types, utilities, and data model                  |
| [@javelin/ecs](./packages/ecs)                           | Build games using the ECS pattern                      |
| [@javelin/net](./packages/net)                           | Synchronize ECS worlds                                 |
| [@javelin/pack](./packages/pack)                         | Convert objects to and from binary arrays              |
| [@javelin/hrtime-loop](./packages/hrtime-loop)           | Create smooth, high-precision game loops in NodeJS     |
| [@javelin/isomorphic-utils](./packages/isomorphic-utils) | Universal utils requiring separate browser/node builds |

## Examples

| Name                          | Description                                               | NPM Script        |
| ----------------------------- | --------------------------------------------------------- | ----------------- |
| [spin](./examples/spin)       | Entity/component synchronization over WebRTC datachannels | `example:spin`    |
| [interop](./examples/interop) | Interop with Cannon and Three.js objects                  | `example:interop` |

## Development

This project is a monorepository (monorepo for short), which is a collection of independent NPM packages that are located in the same repository for improved development, publishing, and visibility.

You can "bootstrap" all monorepo and package dependencies using the following command:

```sh
pnpm i
```

Build times are quick thanks to TypeScript project references. You can build (or re-build) all packages like so:

```sh
pnpm build --recursive
```

The structure of the monorepo looks something like this:

```
packages/
├── core/
│   ├── dist/
│   │   ├── esm/
│   │   │   ├── index.js
│   │   │   ├── index.d.ts
│   │   │   └── ...
│   │   └── cjs/index.js
│   ├── src/
│   │   ├── index.js
│   │   └── ...
│   ├── README.md
│   ├── package.json
│   └── tsconfig.json
├── ecs/
└── ...
```

Where each package has its own README file, TypeScript configuration file, source and dist directories, and scripts which describe how the package is cleaned, build, and prepared for publishing.

Each package has the following specified in its package.json:

```
"main": "dist/cjs/index.js",
"module": "dist/esm/index.js",
"types": "dist/esm/index.d.ts",
```

Where `"main"` is a CommonJS entrypoint, `"module"` is an ESM entrypoint, and `"types"` is the root `.d.ts` file generated by the TypeScript compiler.

Packages reference eachother using pnpm workspace aliases and TypeScript project references. For example, the `ecs` package depends on `core`, so in the package.json file of `@javelin/ecs`:

```json
{
  "dependencies": {
    "@javelin/core": "workspace:*"
  }
}
```

And in the same package's TypeScript config file, we make sure to include a project reference for faster builds and [other benefits](https://www.typescriptlang.org/docs/handbook/project-references.html):

```json
{
  "references": [{ "path": "../../core" }]
}
```
