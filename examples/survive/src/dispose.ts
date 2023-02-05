import * as j from "@javelin/ecs"

export let DisposeTimer = j.value("f32")

let pruneExpiredDisposablesSystem = (world: j.World) => {
  let time = world.getResource(j.FixedTime)
  world.query(DisposeTimer).each((e, timer) => {
    if (time.currentTime > timer) {
      world.delete(e)
    }
  })
}

export let disposePlugin = (app: j.App) =>
  app.addSystemToGroup(j.FixedGroup.EarlyUpdate, pruneExpiredDisposablesSystem)
