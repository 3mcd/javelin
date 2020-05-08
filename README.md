![CD](https://github.com/3mcd/javelin/workflows/CD/badge.svg?branch=release/next)
[![codecov](https://codecov.io/gh/3mcd/javelin/branch/next/graph/badge.svg)](https://codecov.io/gh/3mcd/javelin)

<img src="./logo.png" width="100px" align="left">

# javelin

Javelin is a suite of packages used to build multiplayer games for the web.

The primary goals of Javelin are speed, minimalism, and ease-of-use. A secondary goal is to provide examples of client-side prediction, input reconciliation, and other algorithms commonly used in fast-paced online games.

## Packages

| Package                                        | Description                          |
| ---------------------------------------------- | ------------------------------------ |
| [@javelin/ecs](./packages/ecs)                 | Entity-Component System              |
| [@javelin/net](./packages/net)                 | Network protocol and utils           |
| [@javelin/hrtime-loop](./packages/hrtime-loop) | High-resolution game loop for NodeJS |

## Examples

| Example                             | Description                                               |
| ----------------------------------- | --------------------------------------------------------- |
| [basic](./examples/basic)           | A basic ECS example                                       |
| [filters](./examples/filters)       | Demonstration of query filters                            |
| [networking](./examples/networking) | Entity/component synchronization over WebRTC datachannels |

## Scripts

| Script                    | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `yarn build`              | Build all packages and examples                  |
| `yarn test`               | Run all unit and integration tests               |
| `yarn perf`               | Run all performance tests                        |
| `yarn example:basic`      | Preview basic ECS capabilities                   |
| `yarn example:filters`    | Preview custom filtering of queries              |
| `yarn example:networking` | An example of synchronizing entities over WebRTC |

## Development

```sh
yarn --ignore-engines
yarn build
yarn example:networking
```

Note that when developing, changes to code in local, dependent packages will not automatically refresh development apps. Just build the dependent packages and restart the dev server process when you want to test a change.
