import {App, component, Group, World} from "@javelin/ecs"
import {Clock} from "./clock.js"

export let DisposeTimer = component("f32")

let prune_expired_disposables_system = (world: World) => {
  let clock = world.get_resource(Clock)
  world.of(DisposeTimer).each((e, timer) => {
    if (clock.time > timer) {
      world.delete(e)
    }
  })
}

export let dispose_plugin = (app: App) =>
  app.add_system_to_group(
    Group.EarlyUpdate,
    prune_expired_disposables_system,
  )
