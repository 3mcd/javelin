import {App, DefaultGroup} from "./app.js"
import {makeResource} from "./resource.js"
import {World} from "./world.js"

export let Step = makeResource<number>()

export let advanceTickSystem = (world: World) => {
  world.setResource(Step, world.getResource(Step) + 1)
}

export let stepPlugin = (app: App) => {
  app
    .addResource(Step, 0)
    .addSystemToGroup(DefaultGroup.Early, advanceTickSystem)
}
