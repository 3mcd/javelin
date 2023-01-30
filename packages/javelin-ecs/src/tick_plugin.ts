import {App, DefaultGroup} from "./app.js"
import {makeResource} from "./resource.js"
import {World} from "./world.js"

export let Tick = makeResource<number>()

export let advanceTickSystem = (world: World) => {
  world.setResource(Tick, world.getResource(Tick) + 1)
}

export let tickPlugin = (app: App) => {
  app
    .addResource(Tick, 0)
    .addSystemToGroup(DefaultGroup.Early, advanceTickSystem)
}
