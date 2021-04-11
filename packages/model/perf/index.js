const {
  createModel,
  number,
  arrayOf,
  string,
  createObserver,
} = require("../dist/cjs")
const { performance } = require("perf_hooks")

const model = new Map([
  [
    0,
    {
      x: number,
      y: number,
      z: number,
      qx: number,
      qy: number,
      qz: number,
      qw: number,
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
  z: 3,
  qx: 1,
  qy: 2,
  qz: 3,
  qw: 4,
  buffer: [1, 2, 3],
}

let n = 100000
let i = 0
let j = 0

const observer = createObserver(model, () => j++)
const observed = observer.observe(instance)
const start_proxy = performance.now()

while (i++ < n) {
  observed.x = i
  observed.y = i
  observed.z = i
  observed.qx = i
  observed.qy = i
  // observed.qz = i
  // observed.qw = i
}

console.log(performance.now() - start_proxy)
