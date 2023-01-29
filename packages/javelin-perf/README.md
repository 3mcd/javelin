# @javelin/perf

<p align="center">
  <img width="50%" src="screenshot.png">
</p>

A runnerless, single-threaded benchmarking library for Node.

## Getting Started

```sh
npm i @javelin/perf
```

src/fibonacci.perf.ts

```ts
import {fibonacci} from "./fibonacci"
import {perf} from "@javelin/perf"

perf("100 elements", () => fibonacci(100))
```

```sh
> ts-node src/fibonacci.perf.ts

src/fibonacci.perf.ts

 100 elements   106,321 ops/s     =   4.13
```

### Setup

```ts
perf("iterator next()", () => {
  let it = fibonacci.iterator({start: 1_000})
  return () => it.next()
})
```

### Options

Run just a single benchmark in a file:

```ts
perf.only("name", () => {})
```

Don't throw an error when a benchmark degrades in performance.

```ts
perf("name", () => {}, {
  throwOnFailure: false,
})
```

### Configuration

```sh
# Throw an error when performance degrades, halting test execution.
THROW_ON_FAILURE=false
# Write failing test stats to perf results files.
WRITE_FAILURES=false
# Number of times to execute each individual test.
PERF_RUNS=15_000
# Number of samples to ignore from upper and lower extremes when computing perf results.
PERF_SAMPLES_TO_DISCARD_PER_EXTREME=100
# Perf results file extension.
MODULE_RESULTS_EXTENSION=".perf-results"
# Perf file extension.
MODULE_EXTENSION=".perf.ts"
```
