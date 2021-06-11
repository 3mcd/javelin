<p align="center">
  <img src="./logo.png" width="100px">
</p>

<p align="center">
  <img src="https://github.com/3mcd/javelin/workflows/CD/badge.svg?branch=release/next" alt="CD">
  <a href="https://codecov.io/gh/3mcd/javelin"><img src="https://codecov.io/gh/3mcd/javelin/branch/master/graph/badge.svg?token=8UMA33S9UL" alt="codecov"></a>
  <a href="https://discord.com/invite/utP7Ep9m"><img src="https://img.shields.io/discord/844566064281026600?logo=discord" alt="discord"></a>
</p>

# javelin

> v.1.0.0 is releasing soon! You can check it out with `npm i @javelin/ecs@1.0.0-alpha.7` and review the progress in the [`next`](https://github.com/3mcd/javelin/tree/next) branch.

Javelin is a collection of packages used to build multiplayer games for the web.

**Note** – each package is an active work in progress and each minor release will likely introduce breaking changes prior to a 1.0 release.

The primary goals of Javelin are developer experience, performance, and a built-in networking protocol. A secondary goal is to provide examples of client-side prediction, input reconciliation, and other algorithms commonly used in fast-paced online games.

Javelin is comprised of an Entity-Component System (ECS) and an associated networking package used to synchronize game data between a client and server (or other clients).

## Docs

Visit https://javelin.games

## Packages

| Package                                        | Description                                          |
| ---------------------------------------------- | ---------------------------------------------------- |
| [@javelin/ecs](./packages/ecs)                 | Build games using the ECS pattern                    |
| [@javelin/net](./packages/net)                 | Synchronize `@javelin/ecs` instances                 |
| [@javelin/hrtime-loop](./packages/hrtime-loop) | Create a smooth, high-resolution game loop in NodeJS |

## Examples

| Example                             | Description                                               |
| ----------------------------------- | --------------------------------------------------------- |
| [networking](./examples/networking) | Entity/component synchronization over WebRTC datachannels |

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
