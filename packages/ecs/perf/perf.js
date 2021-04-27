const { createWorld, createQuery, number } = require("../dist/cjs")
const { createArray } = require("../../model/dist/cjs")

module.exports.run = function run() {
  let n = 1000
  const world = createWorld()
  const componentTypes = [
    { x: number },
    { x: number },
    { x: number },
    { x: number },
    { x: number },
    { x: number },
    { x: number },
    { x: number },
    { x: number },
    { x: number },
  ]
  const components = [
    ...createArray(175000, () => [{ __type__: 1 }]),
    ...createArray(175000, () => [{ __type__: 1 }, { __type__: 3 }]),
    ...createArray(175000, () => [{ __type__: 2 }]),
    ...createArray(175000, () => [
      { __type__: 1 },
      { __type__: 2 },
      { __type__: 3 },
    ]),
    ...createArray(175000, () => [{ __type__: 4 }]),
    ...createArray(175000, () => [{ __type__: 2 }, { __type__: 4 }]),
    ...createArray(175000, () => [
      { __type__: 2 },
      { __type__: 5 },
      { __type__: 8 },
    ]),
    ...createArray(175000, () => [
      { __type__: 5 },
      { __type__: 6 },
      { __type__: 7 },
      { __type__: 9 },
    ]),
    ...createArray(175000, () => [{ __type__: 7 }]),
    ...createArray(175000, () => [{ __type__: 7 }, { __type__: 9 }]),
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
  ].map(c => createQuery(...c))

  const entities = components.map(c => world.spawn(...c))

  let i = n
  let c = 0

  world.tick()

  world.addSystem(() => {
    for (let j = 0; j < queries.length; j++) {
      for (const [entities, [a]] of queries[j]) {
        for (let i = 0; i < entities.length; i++) {
          a[i].x
          c++
        }
      }
    }
  })

  const runStart = Date.now()

  while (i--) {
    world.tick()
  }

  const runEnd = Date.now()

  for (let i = 0; i < entities.length; i++) {
    world.destroy(entities[i])
  }

  components.forEach(c => world.spawn(...c))

  world.reset()

  console.log(`entity_count         | ${components.length}`)
  console.log(`component_type_count | ${componentTypes.length}`)
  console.log(`query_count          | ${queries.length}`)
  console.log(`tick_count           | ${n}`)
  console.log(`tick_time_avg        | ${(runEnd - runStart) / n}ms`)
  console.log(`iters_per_tick       | ${c / n}`)
  console.log(`iters_total          | ${c}`)
}
