import {App, DefaultGroup} from "./app.js"
import {makeResource} from "./resource.js"
import {World} from "./world.js"

export interface Time {
  previousTime: number
  currentTime: number
  deltaTime: number
}
export let Time = makeResource<Time>()

export let advanceTimeSystem = (world: World) => {
  let time = world.getResource(Time)
  let currentTime = performance.now() / 1_000
  let previousTime = time.currentTime
  time.previousTime = previousTime
  time.currentTime = currentTime
  time.deltaTime = currentTime - previousTime
}

export let timePlugin = (app: App) => {
  app
    .addResource(Time, {previousTime: 0, currentTime: 0, deltaTime: 0})
    .addSystemToGroup(DefaultGroup.Early, advanceTimeSystem)
}
