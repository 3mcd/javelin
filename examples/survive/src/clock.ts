import {App, Group, resource, World} from "@javelin/ecs"
import {advanceTimeSystem, Time} from "./time.js"

export let Clock = resource<{time: number; tick: number}>()

export let advanceClockSystem = (world: World) => {
  let {current} = world.getResource(Time)
  let clock = world.getResource(Clock)
  clock.time = current
  clock.tick++
}

export let clockPlugin = (app: App) =>
  app
    .addResource(Clock, {time: 0, tick: 0})
    .addSystemToGroup(Group.Early, advanceClockSystem, _ =>
      _.after(advanceTimeSystem),
    )
