![CD](https://github.com/3mcd/javelin/workflows/CD/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/3mcd/javelin/branch/next/graph/badge.svg)](https://codecov.io/gh/3mcd/javelin)

# javelin

A suite of packages used to create multiplayer games in TypeScript.

**Note: This project is in alpha and will likely break occasionally.**

## Getting Started

```sh
npm i @javelin/ecs
npm i @javelin/net
```

## Packages

| Package                                        | Description                          |
| ---------------------------------------------- | ------------------------------------ |
| [@javelin/ecs](./packages/ecs)                 | Entity-Component System              |
| [@javelin/net](./packages/net)                 | Network protocol and utils           |
| [@javelin/hrtime-loop](./packages/hrtime-loop) | High-resolution game loop for NodeJS |

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
yarn
yarn build
yarn example:networking
```

Note that when developing, changes to code in local, dependent packages will not automatically refresh development apps. Just build the dependent packages and restart the dev server process when you want to test a change.
