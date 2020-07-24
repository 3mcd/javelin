<p align="center">
  <img src="./logo.png" width="100px">
</p>

<p align="center">
  <img src="https://github.com/3mcd/javelin/workflows/CD/badge.svg?branch=release/next" alt="CD">
  <a href="https://codecov.io/gh/3mcd/javelin"><img src="https://codecov.io/gh/3mcd/javelin/branch/next/graph/badge.svg" alt="codecov"></a>
</p>

# javelin

Javelin is a suite of packages used to build multiplayer games for the web.

The primary goals of Javelin are speed, minimalism, and ease-of-use. A secondary goal is to provide examples of client-side prediction, input reconciliation, and other algorithms commonly used in fast-paced online games.

## Packages

| Package                                        | Description                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| [@javelin/ecs](./packages/ecs)                 | Build games using the Entity-Component System pattern            |
| [@javelin/net](./packages/net)                 | Synchronize `@javelin/ecs` instances between client and server   |
| [@javelin/devtool](./packages/devtool)         | Inspect and manipulate remote and local `@javelin/ecs` instances |
| [@javelin/hrtime-loop](./packages/hrtime-loop) | Create a smooth, high-resolution game loop in NodeJS             |

## Examples

| Example                             | Description                                               |
| ----------------------------------- | --------------------------------------------------------- |
| [basic](./examples/basic)           | A basic ECS example                                       |
| [networking](./examples/networking) | Entity/component synchronization over WebRTC datachannels |

## Scripts

| Script                    | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `yarn build`              | Build all packages and examples                  |
| `yarn test`               | Run all unit and integration tests               |
| `yarn perf`               | Run all performance tests                        |
| `yarn example:basic`      | Preview basic ECS capabilities                   |
| `yarn example:networking` | An example of synchronizing entities over WebRTC |

## Development

```sh
yarn --ignore-engines
yarn build
yarn example:networking
```

Note that when developing, changes to code in local, dependent packages will not automatically refresh development apps. Just build the dependent packages and restart the dev server process when you want to test a change.
