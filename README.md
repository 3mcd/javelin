<p align="center">
  <img src="./logo.png" width="120px">
</p>

<p align="center">
  <a href="https://codecov.io/gh/3mcd/javelin"><img src="https://codecov.io/gh/3mcd/javelin/branch/master/graph/badge.svg?token=8UMA33S9UL" alt="codecov"></a>
  <a href="https://discord.gg/AbEWH3taWU"><img src="https://img.shields.io/discord/844566064281026600?logo=discord" alt="discord"></a>
</p>

# Javelin

Join us on [Discord](https://discord.gg/AbEWH3taWU)!

Javelin is an ECS framework for JavaScript and Typescript that provides the means to create multiplayer games for Node and web browsers.

## Docs

Visit https://javelin.dev

## Packages

| Name                                                     | Description                                            |
| -------------------------------------------------------- | ------------------------------------------------------ |
| [@javelin/ecs](./packages/javelin-ecs)                   | Core ECS library                                       |
| [@javelin/net](./packages/javelin-net)                   | Authoritative game server and client                   |
| [@javelin/lib](./packages/javelin-lib)                   | Shared helpers and types                               |

## Examples

| Name                          | Description                                               |
| ----------------------------- | --------------------------------------------------------- |
| [survive](./examples/survive) | Single-player vampire survivors clone                     | 
| [shooty](./examples/shooty)   | Multi-player first-person shooter                         |

## Development

You can bootstrap all monorepo and package dependencies using the following command:

```sh
pnpm i
```

You can build all packages like so:

```sh
pnpm build
```
