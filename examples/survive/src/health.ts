import {App, value, Group, World} from "@javelin/ecs"

export let Health = value("f32")

export let pruneDeadSystem = (world: World) =>
  world.of(Health).each((e, health) => {
    if (health <= 0) {
      world.delete(e)
    }
  })

export let healthPlugin = (app: App) =>
  app.addSystemToGroup(Group.LateUpdate, pruneDeadSystem)
