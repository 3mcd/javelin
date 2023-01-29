import * as j from "@javelin/ecs"
import {Clock} from "./clock.js"

export let DisposeTimer = j.value("f32")

let pruneExpiredDisposablesSystem = (world: j.World) => {
  let clock = world.getResource(Clock)
  world.of(DisposeTimer).each((e, timer) => {
    if (clock.time > timer) {
      world.delete(e)
    }
  })
}

export let disposePlugin = (app: j.App) =>
  app.addSystemToGroup(j.Group.EarlyUpdate, pruneExpiredDisposablesSystem)
