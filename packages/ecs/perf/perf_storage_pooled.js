const { createWorld } = require("../dist/world")
const { query, select } = require("../dist/query")
const { arrayOf } = require("../dist/util/array")
const { createComponentFactory } = require("../dist/helpers/component_helpers")

module.exports.run = function run() {
  let n = 1000
  const world = createWorld([])
  const factories = [
    createComponentFactory({ schema: {}, type: 1 }),
    createComponentFactory({ schema: {}, type: 2 }),
    createComponentFactory({ schema: {}, type: 3 }),
    createComponentFactory({ schema: {}, type: 4 }),
  ]
  const entityComponents = [
    ...arrayOf(90000, () => [factories[0].create()]),
    ...arrayOf(90000, () => [factories[0].create(), factories[2].create()]),
    ...arrayOf(90000, () => [factories[1].create()]),
    ...arrayOf(90000, () => [
      factories[0].create(),
      factories[1].create(),
      factories[2].create(),
    ]),
    ...arrayOf(90000, () => [factories[3].create()]),
    ...arrayOf(90000, () => [factories[1].create(), factories[3].create()]),
  ]
  const queries = [
    [factories[0]],
    [factories[0], factories[1]],
    [factories[2]],
    [factories[1], factories[3]],
  ].map(c => query(select(...c)))
  console.time("create")
  const entities = entityComponents.map(c => world.create(c))
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

  console.log(`entities      | ${entityComponents.length}`)
  console.log(`components    | ${factories.length}`)
  console.log(`queries       | ${queries.length}`)
  console.log(`ticks         | ${n}`)
  console.log(`iter          | ${c}`)
  console.log(`iter_tick     | ${c / n}`)
  console.log(`avg_tick      | ${(end - start) / n}ms`)
}
