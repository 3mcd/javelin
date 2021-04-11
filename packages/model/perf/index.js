const { number, arrayOf, string, createObserver } = require("../dist/cjs")
const { performance } = require("perf_hooks")

const model = new Map([
  [
    0,
    {
      x: number,
      y: number,
      buffer: arrayOf(number),
    },
  ],
  [
    1,
    {
      inventory: arrayOf({
        name: string,
        stats: {
          damage: number,
          speed: number,
        },
      }),
    },
  ],
])
const instance = {
  _tid: 0,
  x: 1,
  y: 2,
  buffer: [1, 2, 3],
}

let n = 1000000
let i = 0
let j = 0

const observer = createObserver(model, () => j++)
const start = performance.now()

while (i++ < n) {
  const observed = observer.observe(instance)
  observed.x = i
  observed.y = i
  // observed.buffer[2] = i
}

console.log(n / (performance.now() - start), "ops/ms")
console.log(instance)
