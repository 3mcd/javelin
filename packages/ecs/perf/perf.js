const { number, createWorld, query, arrayOf } = require("../dist/cjs")

module.exports.run = function run() {
  let n = 1000
  const world = createWorld()
  const componentTypes = [
    { schema: { value: number }, type: 1 },
    { schema: { value: number }, type: 2 },
    { schema: { value: number }, type: 3 },
    { schema: { value: number }, type: 4 },
    { schema: { value: number }, type: 5 },
    { schema: { value: number }, type: 6 },
    { schema: { value: number }, type: 7 },
    { schema: { value: number }, type: 8 },
    { schema: { value: number }, type: 9 },
    { schema: { value: number }, type: 10 },
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
      for (const [entities, [a]] of queries[j]) {
        for (let i = 0; i < entities.length; i++) {
          a[i].value
          c++
        }
      }
      // const records = queries[j].records
      // for (let i = 0; i < records.length; i++) {
      //   const {
      //     entities,
      //     columns: [first],
      //   } = records[i]
      //   for (let j = 0; j < entities.length; j++) {
      //     first[j].value
      //     c++
      //   }
      // }
      // for (const [entity, first] of queries[j]) {
      //   first.value
      //   c++
      // }
      // queries[j].forEach((entity, [first]) => {
      //   first.value
      //   c++
      // })
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
  console.log(`iter_tick     | ${c / n}`)
  console.log(`iter_total    | ${c}`)
  console.log(`avg_tick      | ${(runEnd - runStart) / n}ms`)
}
