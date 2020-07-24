const { createWorld } = require("../dist/world")
const { query, select } = require("../dist/query")
const { arrayOf } = require("../dist/util/array")

module.exports.run = function run() {
  let n = 1000
  const world = createWorld()
  const componentTypes = [
    { schema: {}, type: 1 },
    { schema: {}, type: 2 },
    { schema: {}, type: 3 },
    { schema: {}, type: 4 },
  ]
  const components = [
    ...arrayOf(90000, () => [{ _t: 1 }]),
    ...arrayOf(90000, () => [{ _t: 1 }, { _t: 3 }]),
    ...arrayOf(90000, () => [{ _t: 2 }]),
    ...arrayOf(90000, () => [{ _t: 1 }, { _t: 2 }, { _t: 3 }]),
    ...arrayOf(90000, () => [{ _t: 4 }]),
    ...arrayOf(90000, () => [{ _t: 2 }, { _t: 4 }]),
  ]
  const queries = [
    [componentTypes[0]],
    [componentTypes[0], componentTypes[1]],
    [componentTypes[2]],
    [componentTypes[1], componentTypes[3]],
  ].map(c => query(select(...c)))

  console.time("create")
  const entities = components.map(c => world.create(c))
  console.timeEnd("create")

  let i = n
  let c = 0
  const start = Date.now()

  world.tick()
  world.tick()

  world.addSystem(() => {
    for (let j = 0; j < queries.length; j++) {
      for (const _ of queries[j](world)) {
        c++
      }
    }
  })

  console.time("run")
  while (i >= 0) {
    world.tick()
    i--
  }
  console.timeEnd("run")

  const end = Date.now()

  console.time("destroy")
  for (let i = 0; i < entities.length; i++) {
    world.destroy(entities[i])
  }
  console.timeEnd("destroy")

  console.log(`entities      | ${components.length}`)
  console.log(`components    | ${componentTypes.length}`)
  console.log(`queries       | ${queries.length}`)
  console.log(`ticks         | ${n}`)
  console.log(`iter          | ${c}`)
  console.log(`iter_tick     | ${c / n}`)
  console.log(`avg_tick      | ${(end - start) / n}ms`)
}
