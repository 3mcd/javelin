import {App, value, Group, World} from "@javelin/ecs"
import {Clock} from "./clock.js"

export let DisposeTimer = value("f32")

let pruneExpiredDisposablesSystem = (world: World) => {
  let clock = world.getResource(Clock)
  world.of(DisposeTimer).each((e, timer) => {
    if (clock.time > timer) {
      world.delete(e)
    }
  })
}

export let disposePlugin = (app: App) =>
  app.addSystemToGroup(
    Group.EarlyUpdate,
    pruneExpiredDisposablesSystem,
  )
