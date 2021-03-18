const { createWorld } = require("../dist/cjs/world")
const { query } = require("../dist/cjs/query")
const { arrayOf } = require("../dist/cjs/util/array")

module.exports.run = function run() {
  let n = 1000
  const world = createWorld()
  const componentTypes = [
    { schema: {}, type: 1 },
    { schema: {}, type: 2 },
    { schema: {}, type: 3 },
    { schema: {}, type: 4 },
    { schema: {}, type: 5 },
    { schema: {}, type: 6 },
    { schema: {}, type: 7 },
    { schema: {}, type: 8 },
    { schema: {}, type: 9 },
    { schema: {}, type: 10 },
  ]
  const components = [
    ...arrayOf(175000, () => [{ _tid: 1 }]),
    ...arrayOf(175000, () => [{ _tid: 1 }, { _tid: 3 }]),
    ...arrayOf(175000, () => [{ _tid: 2 }]),
    ...arrayOf(175000, () => [{ _tid: 1 }, { _tid: 2 }, { _tid: 3 }]),
    ...arrayOf(175000, () => [{ _tid: 4 }]),
    ...arrayOf(175000, () => [{ _tid: 2 }, { _tid: 4 }]),
    ...arrayOf(175000, () => [{ _tid: 2 }, { _tid: 5 }, { _tid: 8 }]),
    ...arrayOf(175000, () => [
      { _tid: 5 },
      { _tid: 6 },
      { _tid: 7 },
      { _tid: 9 },
    ]),
    ...arrayOf(175000, () => [{ _tid: 7 }]),
    ...arrayOf(175000, () => [{ _tid: 7 }, { _tid: 9 }]),
  ]
  const queries = [
    [componentTypes[0]],
    [componentTypes[0], componentTypes[1]],
    [componentTypes[2]],
    [componentTypes[1], componentTypes[3]],
    [componentTypes[1], componentTypes[3]],
    [componentTypes[6], componentTypes[8]],
    [componentTypes[4], componentTypes[5], componentTypes[6]],
    [componentTypes[1], componentTypes[3]],
    [componentTypes[7]],
    [componentTypes[8], componentTypes[9]],
  ].map(c => query(...c))

  console.time("create")
  const entities = components.map(c => world.spawn(...c))
  console.timeEnd("create")

  let i = n
  let c = 0

  world.tick()

  world.addSystem(() => {
    for (let j = 0; j < queries.length; j++) {
      queries[j].forEach(entity => {
        c++
      })
    }
  })

  const runStart = Date.now()

  while (i--) {
    world.tick()
  }

  const runEnd = Date.now()

  console.time("destroy")
  for (let i = 0; i < entities.length; i++) {
    world.destroy(entities[i])
  }
  console.timeEnd("destroy")

  components.forEach(c => world.spawn(...c))

  console.time("reset")
  world.reset()
  console.timeEnd("reset")

  console.log(`entities      | ${components.length}`)
  console.log(`components    | ${componentTypes.length}`)
  console.log(`queries       | ${queries.length}`)
  console.log(`ticks         | ${n}`)
  console.log(`iter          | ${c}`)
  console.log(`iter_tick     | ${c / n}`)
  console.log(`avg_tick      | ${(runEnd - runStart) / n}ms`)
}
