const { performance } = require("perf_hooks")
const {
  createWorld,
  effAttach,
  effDetach,
  query,
  createComponentType,
} = require("../dist/cjs")

const A = createComponentType({
  type: 0,
  schema: {},
})
const B = createComponentType({
  type: 1,
  schema: {},
})

module.exports.run = () => {
  let i = 0

  const qa = createQuery(A)

  const sysAttach = world => {
    for (const [entities] of qa) {
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        if (!world.has(entity, B)) {
          world.attach(entity, world.component(B))
        }
      }
    }
    effDetach(A).forEach(entity => {
      world.detach(entity, B)
      i++
    })
  }
  const sysDetach = world => {
    effAttach(B).forEach(entity => {
      world.detach(entity, B)
      i++
    })
  }

  const world = createWorld({ systems: [sysAttach, sysDetach] })

  for (let i = 0; i < 1000000; i++) {
    world.spawn(world.component(A))
  }

  const start = performance.now()
  for (let i = 0; i < 100; i++) {
    world.tick()
  }
  const time = performance.now() - start
  console.log(time / 100)
  console.log(i)
}
