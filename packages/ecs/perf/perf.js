const { createWorld } = require("../dist/cjs/world")
const { queryCached } = require("../dist/cjs/query")
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
    ...arrayOf(142500, () => [{ _tid: 1, _cst: ComponentState.Attached }]),
    ...arrayOf(142500, () => [
      { _tid: 1, _cst: ComponentState.Attached },
      { _tid: 3, _cst: ComponentState.Attached },
    ]),
    ...arrayOf(142500, () => [{ _tid: 2, _cst: ComponentState.Attached }]),
    ...arrayOf(142500, () => [
      { _tid: 1, _cst: ComponentState.Attached },
      { _tid: 2, _cst: ComponentState.Attached },
      { _tid: 3, _cst: ComponentState.Attached },
    ]),
    ...arrayOf(142500, () => [{ _tid: 4, _cst: ComponentState.Attached }]),
    ...arrayOf(142500, () => [
      { _tid: 2, _cst: ComponentState.Attached },
      { _tid: 4, _cst: ComponentState.Attached },
    ]),
  ]
  const queries = [
    [componentTypes[0]],
    [componentTypes[0], componentTypes[1]],
    [componentTypes[2]],
    [componentTypes[1], componentTypes[3]],
  ].map(c => queryCached(world, ...c))

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
