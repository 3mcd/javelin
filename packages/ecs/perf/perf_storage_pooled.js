const { createWorld } = require("../dist/cjs/world")
const { query, select } = require("../dist/cjs/query")
const { arrayOf } = require("../dist/cjs/util/array")
const { createComponentType } = require("../dist/cjs/helpers/component_helpers")

module.exports.run = function run() {
  let n = 1000
  const componentTypes = [
    createComponentType({ name: "1", schema: {}, type: 1 }),
    createComponentType({ name: "2", schema: {}, type: 2 }),
    createComponentType({ name: "3", schema: {}, type: 3 }),
    createComponentType({ name: "4", schema: {}, type: 4 }),
  ]
  const world = createWorld({ componentTypes })
  const entityComponents = [
    ...arrayOf(75000, () => [world.component(componentTypes[0])]),
    ...arrayOf(75000, () => [
      world.component(componentTypes[0]),
      world.component(componentTypes[2]),
    ]),
    ...arrayOf(75000, () => [world.component(componentTypes[1])]),
    ...arrayOf(75000, () => [
      world.component(componentTypes[0]),
      world.component(componentTypes[1]),
      world.component(componentTypes[2]),
    ]),
    ...arrayOf(75000, () => [world.component(componentTypes[3])]),
    ...arrayOf(75000, () => [
      world.component(componentTypes[1]),
      world.component(componentTypes[3]),
    ]),
  ]
  const queries = [
    [componentTypes[0]],
    [componentTypes[0], componentTypes[1]],
    [componentTypes[2]],
    [componentTypes[1], componentTypes[3]],
  ].map(c => query(...c))
  console.time("create")
  const entities = entityComponents.map(c => world.entity(c))
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

  console.log(`entities      | ${entityComponents.length}`)
  console.log(`components    | ${componentTypes.length}`)
  console.log(`queries       | ${queries.length}`)
  console.log(`ticks         | ${n}`)
  console.log(`iter          | ${c}`)
  console.log(`iter_tick     | ${c / n}`)
  console.log(`avg_tick      | ${(end - start) / n}ms`)
}
