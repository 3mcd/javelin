const { performance } = require("perf_hooks")
const { createObserver } = require("../dist/cjs/observer")
const { field, uint8, uint32, float64 } = require("@javelin/pack")

const model = new Map([
  [
    0,
    {
      _tid: field(uint8),
      x: field(float64),
      y: field(float64),
      nested: { a: field(uint32) },
      arr_simple: [field(uint8)],
      arr_schema: [
        {
          y: field(float64),
        },
      ],
    },
  ],
  [
    1,
    {
      _tid: field(uint8),
    },
  ],
])
let j = 0
const observer = createObserver(model, () => {
  j++
})
const observed = observer.observe({
  _tid: 0,
  x: 1,
  y: 2,
  nested: { a: 2 },
  arr_simple: [2, 3, 4],
  arr_schema: [{ y: 3 }],
})

let i = 0
let n = 1000000

// console.time("fast")
// while (i++ < n) {
//   object.x = i
//   object.y = i + 1
//   // object.nested.a = i
//   // object.arr_simple[1] = i
//   // object.arr_schema[0].y = i
// }
// console.timeEnd("fast")

i = 0

const start = performance.now()
while (i++ < n) {
  observed.x = 10
  // observed.y = i + 1
  // observed.nested.a = i
  observed.arr_simple[2] = i
  // observed.arr_schema[0].y = i
}
console.log(performance.now() - start)
console.log(j)
