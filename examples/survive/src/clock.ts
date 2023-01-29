import * as j from "@javelin/ecs"
import {advanceTimeSystem, Time} from "./time.js"

export let Clock = j.resource<{time: number; tick: number}>()

export let advanceClockSystem = (world: j.World) => {
  let {current} = world.getResource(Time)
  let clock = world.getResource(Clock)
  clock.time = current
  clock.tick++
}

export let clockPlugin = (app: j.App) =>
  app
    .addResource(Clock, {time: 0, tick: 0})
    .addSystemToGroup(
      j.Group.Early,
      advanceClockSystem,
      j.after(advanceTimeSystem),
    )
