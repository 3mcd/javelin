const { createStorage } = require("../dist/storage")
const { createQuery } = require("../dist/query")
const { arrayOf } = require("../dist/util/array")

module.exports.run = function run() {
  let n = 100
  const storage = createStorage()
  const components = [
    { schema: {}, type: 1 },
    { schema: {}, type: 2 },
    { schema: {}, type: 3 },
    { schema: {}, type: 4 },
  ]
  const entityComponents = [
    ...arrayOf(50000, () => [{ _t: 1 }]),
    ...arrayOf(50000, () => [{ _t: 1 }, { _t: 3 }]),
    ...arrayOf(50000, () => [{ _t: 2 }]),
    ...arrayOf(50000, () => [{ _t: 1 }, { _t: 2 }, { _t: 3 }]),
    ...arrayOf(50000, () => [{ _t: 4 }]),
    ...arrayOf(50000, () => [{ _t: 2 }, { _t: 4 }]),
  ]
  const queries = [
    [components[0]],
    [components[0], components[1]],
    [components[2]],
    [components[1], components[3]],
  ].map(c => createQuery(...c))
  const entities = entityComponents.map(c => storage.insert(c))

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

  const end = Date.now()

  for (let i = 0; i < entities.length; i++) {
    storage.remove(entities[i])
  }

  console.log(`entities      | ${entityComponents.length}`)
  console.log(`components    | ${components.length}`)
  console.log(`queries       | ${queries.length}`)
  console.log(`ticks         | ${n}`)
  console.log(`iter_tick     | ${c / n}`)
  console.log(`avg_tick      | ${(end - start) / n}ms`)
}
