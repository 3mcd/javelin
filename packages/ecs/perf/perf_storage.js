const { createWorld } = require("../dist/cjs/world")
const { query } = require("../dist/cjs/query")
const { arrayOf } = require("../dist/cjs/util/array")
const { ComponentState } = require("../dist/cjs/component")

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
    ...arrayOf(142500, () => [{ tid: 1, cst: ComponentState.Initialized }]),
    ...arrayOf(142500, () => [
      { tid: 1, cst: ComponentState.Initialized },
      { tid: 3, cst: ComponentState.Initialized },
    ]),
    ...arrayOf(142500, () => [{ tid: 2, cst: ComponentState.Initialized }]),
    ...arrayOf(142500, () => [
      { tid: 1, cst: ComponentState.Initialized },
      { tid: 2, cst: ComponentState.Initialized },
      { tid: 3, cst: ComponentState.Initialized },
    ]),
    ...arrayOf(142500, () => [{ tid: 4, cst: ComponentState.Initialized }]),
    ...arrayOf(142500, () => [
      { tid: 2, cst: ComponentState.Initialized },
      { tid: 4, cst: ComponentState.Initialized },
    ]),
  ]
  const queries = [
    [componentTypes[0]],
    [componentTypes[0], componentTypes[1]],
    [componentTypes[2]],
    [componentTypes[1], componentTypes[3]],
  ].map(c => query(...c))

  console.time("create")
  const entities = components.map(c => world.spawn(...c))
  console.timeEnd("create")

  let i = n
  let c = 0
  const start = Date.now()

  world.tick()

  world.addSystem(() => {
    for (let j = 0; j < queries.length; j++) {
      for (const _ of queries[j](world)) {
        c++
      }
    }
  })

  console.time("run")
  while (i--) {
    world.tick()
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
