const { createStorage } = require("../dist/storage")
const { createQuery } = require("../dist/query")
const { arrayOf } = require("../dist/util/array")

module.exports.run = function run() {
  let n = 100
  const storage = createStorage()
  const componentTypes = [
    { schema: {}, type: 1 },
    { schema: {}, type: 2 },
    { schema: {}, type: 3 },
    { schema: {}, type: 4 },
  ]
  const components = [
    ...arrayOf(50000, () => [{ _t: 1 }]),
    ...arrayOf(50000, () => [{ _t: 1 }, { _t: 3 }]),
    ...arrayOf(50000, () => [{ _t: 2 }]),
    ...arrayOf(50000, () => [{ _t: 1 }, { _t: 2 }, { _t: 3 }]),
    ...arrayOf(50000, () => [{ _t: 4 }]),
    ...arrayOf(50000, () => [{ _t: 2 }, { _t: 4 }]),
  ]
  const queries = [
    [componentTypes[0]],
    [componentTypes[0], componentTypes[1]],
    [componentTypes[2]],
    [componentTypes[1], componentTypes[3]],
  ].map(c => createQuery(...c))
  console.time("create")
  const entities = components.map(c => storage.create(c))
  console.timeEnd("create")

  let i = n
  let c = 0
  const start = Date.now()

  console.time("run")
  while (i >= 0) {
    for (let j = 0; j < queries.length; j++) {
      for (const _ of queries[j].run(storage)) {
        c++
      }
    }
    i--
  }
  console.timeEnd("run")

  const end = Date.now()

  console.time("destroy")
  for (let i = 0; i < entities.length; i++) {
    storage.destroy(entities[i])
  }
  console.timeEnd("destroy")

  console.log(`entities      | ${components.length}`)
  console.log(`components    | ${componentTypes.length}`)
  console.log(`queries       | ${queries.length}`)
  console.log(`ticks         | ${n}`)
  console.log(`iter_tick     | ${c / n}`)
  console.log(`avg_tick      | ${(end - start) / n}ms`)
}
