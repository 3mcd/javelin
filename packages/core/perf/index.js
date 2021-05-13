const {
  createModel,
  number,
  arrayOf,
  string,
  createObserver,
} = require("../dist/cjs")
const { performance } = require("perf_hooks")

const config = new Map([
  [
    0,
    {
      x: number,
      y: number,
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
const model = createModel(config)
const observer = createObserver()
const instance = {
  __type__: 0,
  x: 1,
  y: 2,
  inventory: [
    { name: "sword", stats: { damage: 5, speed: 3 } },
    { name: "shield", stats: { damage: 3, speed: 1 } },
  ],
}

let n = 1000000
let i = 0

const observed = observer.observe(instance, model[0])
const start_proxy = performance.now()

while (i++ < n) {
  observed.x = instance.x + 1
  observed.y = instance.y + 1
  //   observed.inventory[0].stats.speed = 10
  //   observed.inventory[1].name = "hi"
  //   observed.inventory.push({
  //     name: "spaghetti",
  //     stats: { damage: 1000, speed: 0 },
  //   })
  //   observed.inventory.splice(0, 1)
}

console.log(performance.now() - start_proxy)
// console.log(observer.changes.get(instance))
// console.log(observer.changes.get(instance).arra)
