import * as j from "@javelin/ecs"

export let Health = j.value("f32")

export let pruneDeadSystem = (world: j.World) =>
  world.query(Health).each((e, health) => {
    if (health <= 0) {
      world.delete(e)
    }
  })

export let healthPlugin = (app: j.App) =>
  app.addSystemToGroup(j.FixedGroup.LateUpdate, pruneDeadSystem)
