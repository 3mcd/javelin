# @javelin/net

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
