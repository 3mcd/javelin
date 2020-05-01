const { Storage } = require("../dist/storage")
const { Query } = require("../dist/query")
const { arrayOf } = require("../dist/util/array")
const { createComponentFactory } = require("../dist/helpers/component_helpers")

module.exports.run = function run() {
  let n = 100
  const storage = new Storage()
  const factories = [
    createComponentFactory({ schema: {}, type: 2 ** 0 }),
    createComponentFactory({ schema: {}, type: 2 ** 1 }),
    createComponentFactory({ schema: {}, type: 2 ** 2 }),
    createComponentFactory({ schema: {}, type: 2 ** 3 }),
  ]
  const entityComponents = [
    ...arrayOf(25000, () => [factories[0].create()]),
    ...arrayOf(25000, () => [factories[0].create(), factories[2].create()]),
    ...arrayOf(25000, () => [factories[1].create()]),
    ...arrayOf(25000, () => [
      factories[0].create(),
      factories[1].create(),
      factories[2].create(),
    ]),
    ...arrayOf(25000, () => [factories[3].create()]),
    ...arrayOf(25000, () => [factories[1].create(), factories[3].create()]),
  ]
  const queries = [
    [factories[0]],
    [factories[0], factories[1]],
    [factories[2]],
    [factories[1], factories[3]],
  ].map(c => new Query(c))
  const entities = entityComponents.map((c, i) => storage.insert(i, c))

  let i = n
  let c = 0
  const start = Date.now()

  while (i >= 0) {
    for (let j = 0; j < queries.length; j++) {
      for (const _ of queries[j].run(storage)) {
        c++
      }
    }
    i--
  }

  for (let i = 0; i < entities.length; i++) {
    storage.remove(entities[i])
  }

  const end = Date.now()

  console.log(`entities      | ${entityComponents.length}`)
  console.log(`components    | ${factories.length}`)
  console.log(`queries       | ${queries.length}`)
  console.log(`ticks         | ${n}`)
  console.log(`iter_tick     | ${c / n}`)
  console.log(`avg_tick      | ${(end - start) / n}ms`)
}
