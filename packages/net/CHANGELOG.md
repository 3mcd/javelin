# @javelin/net

## 1.0.0-alpha.12

### Patch Changes

- Force publishing new version to fix workspace dependencies
- Updated dependencies [undefined]
  - @javelin/core@1.0.0-alpha.12
  - @javelin/ecs@1.0.0-alpha.12
  - @javelin/pack@1.0.0-alpha.12

## 1.0.0-alpha.11

### Patch Changes

- Improved generic type parameters and fixed a couple of compatibility errors. Javelin should now work with latest Node 12 versions. Also fixed issue with Webpack with introduction of new isomorphic-utils package.
- Updated dependencies [undefined]
  - @javelin/core@1.0.0-alpha.10
  - @javelin/ecs@1.0.0-alpha.10
  - @javelin/pack@1.0.0-alpha.10

## 1.0.0-alpha.10

### Patch Changes

- A few minor API tweaks and performance improvements to priority accumulator
- Updated dependencies [undefined]
  - @javelin/core@1.0.0-alpha.9
  - @javelin/ecs@1.0.0-alpha.9
  - @javelin/pack@1.0.0-alpha.9

## 1.0.0-alpha.9

### Patch Changes

- Fix issue where encoded components were skipped during deserialization causing an out-of-range error.

## 1.0.0-alpha.8

### Patch Changes

- This release renames the effect option `global` to `shared`, and fixes a bug in `MessageProducer` where removed components were recreated on the client via update operations.
- Updated dependencies [undefined]
  - @javelin/core@1.0.0-alpha.8
  - @javelin/ecs@1.0.0-alpha.8
  - @javelin/pack@1.0.0-alpha.8
