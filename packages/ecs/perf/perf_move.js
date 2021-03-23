const { performance } = require("perf_hooks")
const {
  createWorld,
  onAttach,
  onDetach,
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

  const qa = query(A)

  const sys_attach = world => {
    for (const [entities] of qa) {
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        if (!world.has(entity, B)) {
          world.attach(entity, world.component(B))
        }
      }
    }
    onDetach(A).forEach(entity => {
      world.detach(entity, B)
      i++
    })
  }
  const sys_detach = world => {
    onAttach(B).forEach(entity => {
      world.detach(entity, B)
      i++
    })
  }

  const world = createWorld({ systems: [sys_attach, sys_detach] })

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
