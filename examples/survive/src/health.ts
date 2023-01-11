import {App, component, Group, World} from "@javelin/ecs"

export let Health = component("f32")

export let prune_dead_system = (world: World) =>
  world.of(Health).each((e, health) => {
    if (health <= 0) {
      world.delete(e)
    }
  })

export let health_plugin = (app: App) =>
  app.add_system_to_group(Group.LateUpdate, prune_dead_system)
