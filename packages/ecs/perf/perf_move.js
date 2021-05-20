const { performance } = require("perf_hooks")
const {
  createWorld,
  useTrigger,
  createQuery,
  component,
} = require("../dist/cjs")

const A = {}
const B = {}

module.exports.run = () => {
  const n = 10000
  const t = 100

  console.log(`swapping component A-B of ${n} entities for ${t} ticks`)

  let ops = 0

  const qa = createQuery(A)

  const attach = world => {
    for (const [entities] of qa) {
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        if (!world.has(entity, B)) {
          world.attach(entity, component(B))
        }
      }
    }
    useTrigger(A, undefined, entity => {
      world.detach(entity, B)
      ops++
    })
  }
  const detach = world => {
    useTrigger(B, entity => {
      world.detach(entity, B)
      ops++
    })
  }

  const world = createWorld({ systems: [attach, detach] })

  for (let i = 0; i < n; i++) {
    world.create(component(A))
  }

  const start = performance.now()
  for (let i = 0; i < t; i++) {
    world.step()
  }
  const time = performance.now() - start
  console.log(`tick_count     | ${t}`)
  console.log(`tick_time_avg  | ${time / t} ms`)
  console.log(`ops_per_tick   | ${ops / t}`)
}
