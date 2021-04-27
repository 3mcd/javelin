const { performance } = require("perf_hooks")
const {
  createWorld,
  effTrigger,
  createQuery,
  component,
} = require("../dist/cjs")

const A = {}
const B = {}

module.exports.run = () => {
  let i = 0

  const qa = createQuery(A)

  const sysAttach = world => {
    for (const [entities] of qa) {
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        if (!world.has(entity, B)) {
          world.attach(entity, component(B))
        }
      }
    }
    effTrigger(A, undefined, entity => {
      world.detach(entity, B)
      i++
    })
  }
  const sysDetach = world => {
    effTrigger(B, entity => {
      world.detach(entity, B)
      i++
    })
  }

  const world = createWorld({ systems: [sysAttach, sysDetach] })

  for (let i = 0; i < 10000; i++) {
    world.spawn(component(A))
  }

  const start = performance.now()
  for (let i = 0; i < 100; i++) {
    world.tick()
  }
  const time = performance.now() - start
  console.log(time / 100)
  console.log(i)
}
