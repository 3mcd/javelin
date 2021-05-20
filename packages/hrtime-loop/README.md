# `@javelin/hrtime-loop`

A tiny, high-resolution game loop for NodeJS 10+. Utilizes the `setImmediate` and `setTimeout` schedulers in conjunction to maintain a balance of precision and performance.

## Installation

```
npm i @javelin/hrtime-loop
```

## Usage

```ts
import { createHrtimeLoop } from "@javelin/hrtime-loop"

const loop = createHrtimeLoop(clock => {
  // (bigint) monotonic time
  clock.now
  // (number) total number of ticks
  clock.tick
  // (number) time since last tick in ms
  clock.dt
}, (1 / 60) * 1000 /* tick interval (ms) */)

// Start the loop
loop.start()
// Stop the loop
loop.stop()
// Check if loop is running
loop.isRunning()
```

## Performance

`yarn perf` will run performance tests. Example `perf` output:

```
tick_interval | 16.666666666666668
ticks         | 1000
avg_tick      | 16.678785390999984
accuracy      | 99.927%
precision     | 100.000%
```
