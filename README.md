<p align="center">
  <img src="./logo-light.png#gh-dark-mode-only" width="120px">
  <img src="./logo-dark.png#gh-light-mode-only" width="120px">
</p>

<p align="center">
  <a href="https://codecov.io/gh/3mcd/javelin"><img src="https://codecov.io/gh/3mcd/javelin/branch/master/graph/badge.svg?token=8UMA33S9UL" alt="codecov"></a>
  <a href="https://discord.gg/AbEWH3taWU"><img src="https://img.shields.io/discord/844566064281026600?logo=discord" alt="discord"></a>
</p>

# Javelin

Javelin is an [ECS](https://github.com/SanderMertens/ecs-faq) framework that provides the means to make multiplayer games in JavaScript.

Join us on [Discord](https://discord.gg/AbEWH3taWU)!

## Docs

Visit https://javelin.dev

## Packages

| Name                                     | Description                                  |
| ---------------------------------------- | -------------------------------------------- |
| [@javelin/ecs](./packages/javelin-ecs)   | ECS framework                                |
| [@javelin/net](./packages/javelin-net)   | Authoritative game server and client plugins |
| [@javelin/lib](./packages/javelin-lib)   | Shared helpers and types                     |
| [@javelin/perf](./packages/javelin-perf) | Performance testing library                  |

## Examples

| Name                          | Description                           |
| ----------------------------- | ------------------------------------- |
| [survive](./examples/survive) | Single-player vampire survivors clone |
| [shooty](./examples/shooty)   | Multi-player first-person shooter     |

## Development

Install monorepo and package dependencies:

```sh
pnpm install
```

Build packages:

```sh
pnpm build
```

Run unit tests:

```sh
pnpm test
```

Run performance tests:

```sh
pnpm perf
```

Clear performance test results:

```sh
pnpm reset
```
