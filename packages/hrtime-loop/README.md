# `@javelin/hrtime-loop`

A tiny, high-resolution game loop for NodeJS 10+. Utilizes the `setImmediate` and `setTimeout` schedulers in conjunction to maintain a balance of precision and performance.

## Installation

```
npm i @javelin/hrtime-loop
```

## Usage

```ts
import { createHrtimeLoop } from "@javelin/hrtime-loop"

const loop = createHrtimeLoop(1 / 60, clock => {
  // (bigint) monotonic time
  clock.time
  // (number) time since last tick in ms
  clock.dt
  // (number) total number of ticks
  clock.tick
})

// Start the loop
loop.start()
// Stop the loop
loop.stop()
```

## Performance

`yarn perf` will run performance tests. Example `perf` output:

```
tick_interval | 16.666666666666668
ticks         | 1000
avg_tick      | 16.70963940498233
accuracy      | 99.743%
precision     | 100.000%
```
